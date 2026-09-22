using DontFallGranny.Core;
using UnityEngine;
using UnityEngine.Events;

namespace DontFallGranny.Feedback
{
    public sealed class TensionFeedbackSystem : MonoBehaviour
    {
        [SerializeField] private BalanceController balanceController;

        [Header("Feedback hooks")]
        [SerializeField] private UnityEvent onStable;
        [SerializeField] private UnityEvent onUnstable;
        [SerializeField] private UnityEvent onCritical;
        [SerializeField] private UnityEvent onRecovered;
        [SerializeField] private UnityEvent onFallen;

        private void OnEnable()
        {
            if (balanceController == null)
                return;

            balanceController.StateChanged += HandleStateChanged;
            balanceController.RecoveredFromCritical += HandleRecovered;
            balanceController.Fallen += HandleFallen;
        }

        private void OnDisable()
        {
            if (balanceController == null)
                return;

            balanceController.StateChanged -= HandleStateChanged;
            balanceController.RecoveredFromCritical -= HandleRecovered;
            balanceController.Fallen -= HandleFallen;
        }

        private void HandleStateChanged(BalanceState _, BalanceState current)
        {
            switch (current)
            {
                case BalanceState.Stable:
                    onStable?.Invoke();
                    break;
                case BalanceState.Unstable:
                    onUnstable?.Invoke();
                    break;
                case BalanceState.Critical:
                    onCritical?.Invoke();
                    break;
            }
        }

        private void HandleRecovered()
        {
            onRecovered?.Invoke();
        }

        private void HandleFallen()
        {
            onFallen?.Invoke();
        }
    }
}
