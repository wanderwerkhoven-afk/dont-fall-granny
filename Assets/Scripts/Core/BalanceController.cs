using System;
using UnityEngine;

namespace DontFallGranny.Core
{
    public sealed class BalanceController : MonoBehaviour
    {
        [Header("Balance")]
        [SerializeField, Range(0f, 1f)] private float balance = 1f;
        [SerializeField] private float passiveRecoveryPerSecond = 0.12f;
        [SerializeField, Range(0f, 1f)] private float unstableRecoveryMultiplier = 0.6f;
        [SerializeField, Range(0f, 1f)] private float criticalRecoveryMultiplier = 0.25f;
        [SerializeField] private float unstableThreshold = 0.55f;
        [SerializeField] private float criticalThreshold = 0.22f;

        public float Balance => balance;
        public BalanceState State { get; private set; } = BalanceState.Stable;

        public event Action<BalanceState, BalanceState> StateChanged;
        public event Action<float> BalanceChanged;
        public event Action RecoveredFromCritical;
        public event Action Fallen;

        private void Update()
        {
            if (State == BalanceState.Fallen)
                return;

            float multiplier = State switch
            {
                BalanceState.Critical => criticalRecoveryMultiplier,
                BalanceState.Unstable => unstableRecoveryMultiplier,
                _ => 1f
            };

            AddBalance(passiveRecoveryPerSecond * multiplier * Time.deltaTime);
        }

        public void ApplyImpact(float severity)
        {
            if (State == BalanceState.Fallen)
                return;

            severity = Mathf.Max(0f, severity);
            AddBalance(-severity);
        }

        public void Recover(float amount)
        {
            if (State == BalanceState.Fallen)
                return;

            AddBalance(Mathf.Abs(amount));
        }

        public void ResetBalance()
        {
            balance = 1f;
            SetState(BalanceState.Stable);
            BalanceChanged?.Invoke(balance);
        }

        private void AddBalance(float delta)
        {
            float oldBalance = balance;
            balance = Mathf.Clamp01(balance + delta);

            if (!Mathf.Approximately(oldBalance, balance))
                BalanceChanged?.Invoke(balance);

            EvaluateState();
        }

        private void EvaluateState()
        {
            BalanceState nextState =
                balance <= 0f ? BalanceState.Fallen :
                balance <= criticalThreshold ? BalanceState.Critical :
                balance <= unstableThreshold ? BalanceState.Unstable :
                BalanceState.Stable;

            if (nextState == State)
                return;

            BalanceState oldState = State;
            SetState(nextState);

            if (oldState == BalanceState.Critical &&
                (nextState == BalanceState.Unstable || nextState == BalanceState.Stable))
            {
                RecoveredFromCritical?.Invoke();
            }

            if (nextState == BalanceState.Fallen)
                Fallen?.Invoke();
        }

        private void SetState(BalanceState nextState)
        {
            BalanceState oldState = State;
            State = nextState;
            StateChanged?.Invoke(oldState, nextState);
        }
    }
}
