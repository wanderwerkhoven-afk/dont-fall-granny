using System;
using UnityEngine;
using UnityEngine.Events;

namespace DontFallGranny.Core
{
    public sealed class FallController : MonoBehaviour
    {
        [Header("References")]
        [SerializeField] private BalanceController balanceController;
        [SerializeField] private GameRunStateController runState;
        [SerializeField] private GameTimeController gameTime;
        [SerializeField] private Rigidbody body;
        [SerializeField] private Animator animator;

        [Header("Fall")]
        [SerializeField] private float impactSlowMotionScale = 0.28f;
        [SerializeField] private float impactSlowMotionDuration = 0.22f;
        [SerializeField] private float forwardFallImpulse = 2.4f;
        [SerializeField] private float downwardFallImpulse = 1.6f;

        [Header("Animation")]
        [SerializeField] private string stumbleTrigger = "Stumble";
        [SerializeField] private string fallTrigger = "Fall";
        [SerializeField] private string recoverTrigger = "Recover";

        [Header("Events")]
        [SerializeField] private UnityEvent onStumble;
        [SerializeField] private UnityEvent onFallStarted;
        [SerializeField] private UnityEvent onFallImpact;
        [SerializeField] private UnityEvent onRecovered;

        public bool HasFallen { get; private set; }

        public event Action FallStarted;
        public event Action FallImpact;
        public event Action Recovered;

        private void Awake()
        {
            if (balanceController == null)
                balanceController = GetComponent<BalanceController>();

            if (runState == null)
                runState = GetComponent<GameRunStateController>();

            if (gameTime == null)
                gameTime = GetComponent<GameTimeController>();

            if (body == null)
                body = GetComponent<Rigidbody>();
        }

        private void OnEnable()
        {
            if (balanceController == null)
                return;

            balanceController.StateChanged += HandleStateChanged;
            balanceController.Fallen += HandleFallen;
            balanceController.RecoveredFromCritical += HandleRecoveredFromCritical;
        }

        private void OnDisable()
        {
            if (balanceController == null)
                return;

            balanceController.StateChanged -= HandleStateChanged;
            balanceController.Fallen -= HandleFallen;
            balanceController.RecoveredFromCritical -= HandleRecoveredFromCritical;
        }

        public void ResetFall()
        {
            HasFallen = false;
            gameTime?.CancelHitStop();
            runState?.SetState(GameRunState.Running);

            animator?.ResetTrigger(fallTrigger);
            animator?.ResetTrigger(stumbleTrigger);
            animator?.SetTrigger(recoverTrigger);

            onRecovered?.Invoke();
            Recovered?.Invoke();
        }

        private void HandleStateChanged(BalanceState previous, BalanceState current)
        {
            if (HasFallen)
                return;

            if (current == BalanceState.Unstable || current == BalanceState.Critical)
            {
                animator?.SetTrigger(stumbleTrigger);
                onStumble?.Invoke();
            }
        }

        private void HandleRecoveredFromCritical()
        {
            if (HasFallen)
                return;

            animator?.SetTrigger(recoverTrigger);
            onRecovered?.Invoke();
            Recovered?.Invoke();
        }

        private void HandleFallen()
        {
            if (HasFallen)
                return;

            HasFallen = true;
            runState?.SetState(GameRunState.Fallen);
            animator?.SetTrigger(fallTrigger);

            if (body != null)
            {
                body.AddForce(
                    Vector3.forward * forwardFallImpulse +
                    Vector3.down * downwardFallImpulse,
                    ForceMode.VelocityChange
                );
            }

            onFallStarted?.Invoke();
            FallStarted?.Invoke();

            gameTime?.PlayHitStop(impactSlowMotionScale, impactSlowMotionDuration);

            onFallImpact?.Invoke();
            FallImpact?.Invoke();
        }
    }
}
