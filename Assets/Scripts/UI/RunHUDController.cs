using System.Collections;
using DontFallGranny.Core;
using TMPro;
using UnityEngine;
using UnityEngine.UI;

namespace DontFallGranny.UI
{
    public sealed class RunHUDController : MonoBehaviour
    {
        [SerializeField] private RunDataController runData;
        [SerializeField] private BalanceController balance;
        [SerializeField] private ReducedMotionSettings motionSettings;
        [SerializeField] private TMP_Text distanceLabel;
        [SerializeField] private TMP_Text coinsLabel;
        [SerializeField] private TMP_Text balanceLabel;
        [SerializeField] private TMP_Text nearMissLabel;
        [SerializeField] private Image balanceFill;
        [SerializeField] private RectTransform coinPulseTarget;

        private Coroutine coinPulseRoutine;
        private Coroutine nearMissRoutine;

        private void Awake()
        {
            if (runData == null)
                runData = FindFirstObjectByType<RunDataController>();

            if (balance == null)
                balance = FindFirstObjectByType<BalanceController>();

            if (motionSettings == null)
                motionSettings = FindFirstObjectByType<ReducedMotionSettings>();
        }

        private void OnEnable()
        {
            if (runData != null)
            {
                runData.DistanceChanged += HandleDistanceChanged;
                runData.CoinsChanged += HandleCoinsChanged;
                runData.NearMissChanged += HandleNearMissChanged;
                HandleDistanceChanged(runData.DistanceMeters);
                HandleCoinsChanged(runData.Coins);
                SetNearMissVisible(false);
            }

            if (balance != null)
            {
                balance.StateChanged += HandleBalanceStateChanged;
                balance.BalanceChanged += HandleBalanceChanged;
                HandleBalanceStateChanged(balance.State, balance.State);
                HandleBalanceChanged(balance.Balance);
            }
        }

        private void OnDisable()
        {
            if (runData != null)
            {
                runData.DistanceChanged -= HandleDistanceChanged;
                runData.CoinsChanged -= HandleCoinsChanged;
                runData.NearMissChanged -= HandleNearMissChanged;
            }

            if (balance != null)
            {
                balance.StateChanged -= HandleBalanceStateChanged;
                balance.BalanceChanged -= HandleBalanceChanged;
            }

            StopFeedbackCoroutines();

            if (coinPulseTarget != null)
                coinPulseTarget.localScale = Vector3.one;

            SetNearMissVisible(false);
        }

        private void HandleDistanceChanged(float meters)
        {
            if (distanceLabel != null)
                distanceLabel.text = $"{Mathf.FloorToInt(meters)} m";
        }

        private void HandleCoinsChanged(int coins)
        {
            if (coinsLabel != null)
                coinsLabel.text = $"● {coins}";

            if (motionSettings != null && motionSettings.ReducedMotion)
                return;

            if (coinPulseTarget != null)
            {
                if (coinPulseRoutine != null)
                    StopCoroutine(coinPulseRoutine);

                coinPulseRoutine = StartCoroutine(PulseCoin());
            }
        }

        private void HandleNearMissChanged(int count)
        {
            if (count <= 0 || nearMissLabel == null)
                return;

            nearMissLabel.text = $"NEAR MISS ×{count}";

            if (nearMissRoutine != null)
                StopCoroutine(nearMissRoutine);

            nearMissRoutine = StartCoroutine(ShowNearMiss());
        }

        private void HandleBalanceChanged(float value)
        {
            if (balanceFill != null)
                balanceFill.fillAmount = Mathf.Clamp01(value);
        }

        private void HandleBalanceStateChanged(
            BalanceState _,
            BalanceState current
        )
        {
            if (balanceLabel != null)
            {
                balanceLabel.text =
                    $"BALANCE: {current.ToString().ToUpperInvariant()}";
            }
        }

        private IEnumerator PulseCoin()
        {
            const float duration = 0.16f;
            float elapsed = 0f;

            while (elapsed < duration)
            {
                elapsed += Time.unscaledDeltaTime;
                float t = Mathf.Clamp01(elapsed / duration);
                float bump = Mathf.Sin(t * Mathf.PI) * 0.14f;
                coinPulseTarget.localScale = Vector3.one * (1f + bump);
                yield return null;
            }

            coinPulseTarget.localScale = Vector3.one;
            coinPulseRoutine = null;
        }

        private IEnumerator ShowNearMiss()
        {
            SetNearMissVisible(true);

            float hold = motionSettings != null &&
                         motionSettings.ReducedMotion
                ? 0.65f
                : 0.9f;

            yield return new WaitForSecondsRealtime(hold);

            SetNearMissVisible(false);
            nearMissRoutine = null;
        }

        private void SetNearMissVisible(bool visible)
        {
            if (nearMissLabel != null)
                nearMissLabel.gameObject.SetActive(visible);
        }

        private void StopFeedbackCoroutines()
        {
            if (coinPulseRoutine != null)
            {
                StopCoroutine(coinPulseRoutine);
                coinPulseRoutine = null;
            }

            if (nearMissRoutine != null)
            {
                StopCoroutine(nearMissRoutine);
                nearMissRoutine = null;
            }
        }
    }
}
