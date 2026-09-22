using DontFallGranny.Core;
using TMPro;
using UnityEngine;

namespace DontFallGranny.UI
{
    public sealed class RunHUDController : MonoBehaviour
    {
        [SerializeField] private RunDataController runData;
        [SerializeField] private BalanceController balance;
        [SerializeField] private TMP_Text distanceLabel;
        [SerializeField] private TMP_Text coinsLabel;
        [SerializeField] private TMP_Text balanceLabel;

        private void Awake()
        {
            if (runData == null)
                runData = FindFirstObjectByType<RunDataController>();

            if (balance == null)
                balance = FindFirstObjectByType<BalanceController>();
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
                HandleBalanceStateChanged(balance.State, balance.State);
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
                balance.StateChanged -= HandleBalanceStateChanged;
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
        }

        private void HandleBalanceStateChanged(
            BalanceState _,
            BalanceState current
        )
        {
            if (balanceLabel != null)
                balanceLabel.text = $"BALANCE: {current.ToString().ToUpperInvariant()}";
        }
    }
}
