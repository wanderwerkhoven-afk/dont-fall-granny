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
        [SerializeField] private Image balanceFill;
        [SerializeField] private RectTransform coinPulseTarget;

        private Coroutine coinPulseRoutine;

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
                HandleDistanceChanged(runData.DistanceMeters);
                HandleCoinsChanged(runData.Coins);
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
            }

            if (balance != null)
            {
                balance.StateChanged -= HandleBalanceStateChanged;
                balance.BalanceChanged -= HandleBalanceChanged;
            }

            if (coinPulseRoutine != null)
            {
                StopCoroutine(coinPulseRoutine);
                coinPulseRoutine = null;
            }

            if (coinPulseTarget != null)
                coinPulseTarget.localScale = Vector3.one;
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
                balanceLabel.text =
                    $"BALANCE: {current.ToString().ToUpperInvariant()}";
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
    }
}
