using System;
using UnityEngine;
using UnityEngine.Events;

namespace DontFallGranny.Core
{
    public sealed class RecoveryWindowController : MonoBehaviour
    {
        [Header("References")]
        [SerializeField] private BalanceController balanceController;
        [SerializeField] private GameRunStateController runState;

        [Header("Recovery")]
        [SerializeField] private float normalWindowSeconds = 1.15f;
        [SerializeField] private float heavyWindowSeconds = 0.8f;
        [SerializeField, Range(0f, 1f)] private float successfulRecoveryAmount = 0.24f;
        [SerializeField] private KeyCode keyboardRecoveryKey = KeyCode.Space;

        [Header("Events")]
        [SerializeField] private UnityEvent onRecoveryStarted;
        [SerializeField] private UnityEvent onRecoverySucceeded;
        [SerializeField] private UnityEvent onRecoveryFailed;

        private float recoveryDeadline;

        public bool IsRecovering { get; private set; }
        public float RemainingTime =>
            IsRecovering ? Mathf.Max(0f, recoveryDeadline - Time.time) : 0f;

        public event Action<float> RecoveryStarted;
        public event Action RecoverySucceeded;
        public event Action RecoveryFailed;

        private void Awake()
        {
            if (balanceController == null)
                balanceController = GetComponent<BalanceController>();

            if (runState == null)
                runState = GetComponent<GameRunStateController>();
        }

        private void Update()
        {
            if (!IsRecovering)
                return;

            if (Input.GetKeyDown(keyboardRecoveryKey))
                AttemptRecovery();

            if (Time.time >= recoveryDeadline)
                FailRecovery();
        }

        public void BeginRecovery(bool heavyImpact)
        {
            if (IsRecovering)
                return;

            float duration = heavyImpact ? heavyWindowSeconds : normalWindowSeconds;

            IsRecovering = true;
            recoveryDeadline = Time.time + duration;
            runState?.SetState(GameRunState.Recovering);

            onRecoveryStarted?.Invoke();
            RecoveryStarted?.Invoke(duration);
        }

        public void AttemptRecovery()
        {
            if (!IsRecovering)
                return;

            IsRecovering = false;
            balanceController?.Recover(successfulRecoveryAmount);
            runState?.SetState(GameRunState.Running);

            onRecoverySucceeded?.Invoke();
            RecoverySucceeded?.Invoke();
        }

        public void ForceFall()
        {
            if (!IsRecovering)
                return;

            FailRecovery();
        }

        private void FailRecovery()
        {
            if (!IsRecovering)
                return;

            IsRecovering = false;

            if (balanceController != null)
                balanceController.ApplyImpact(1f);

            onRecoveryFailed?.Invoke();
            RecoveryFailed?.Invoke();
        }
    }
}
