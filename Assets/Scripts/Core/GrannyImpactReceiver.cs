using UnityEngine;

namespace DontFallGranny.Core
{
    public sealed class GrannyImpactReceiver : MonoBehaviour
    {
        [SerializeField] private BalanceController balanceController;
        [SerializeField] private RecoveryWindowController recoveryWindow;

        private void Awake()
        {
            if (balanceController == null)
                balanceController = GetComponent<BalanceController>();

            if (recoveryWindow == null)
                recoveryWindow = GetComponent<RecoveryWindowController>();
        }

        public void ReceiveImpact(float balanceDamage, bool heavyImpact, Vector3 impactPosition)
        {
            if (balanceController == null)
                return;

            if (recoveryWindow != null && recoveryWindow.IsRecovering && heavyImpact)
            {
                recoveryWindow.ForceFall();
                return;
            }

            balanceController.ApplyImpact(balanceDamage);

            if (balanceController.State == BalanceState.Fallen)
                return;

            recoveryWindow?.BeginRecovery(heavyImpact);
        }
    }
}
