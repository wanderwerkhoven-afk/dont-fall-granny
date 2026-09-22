using System;
using System.Collections;
using UnityEngine;
using UnityEngine.Events;

namespace DontFallGranny.Core
{
    public sealed class FallController : MonoBehaviour
    {
        [Header("References")]
        [SerializeField] private BalanceController balanceController;
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

        private Coroutine slowMotionRoutine;

        public bool HasFallen { get; private set; }

        public event Action FallStarted;
        public event Action FallImpact;
        public event Action Recovered;

        private void Awake()
        {
            if (balanceController == null)
                balanceController = GetComponent<BalanceController>();

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

            if (slowMotionRoutine != null)
            {
                StopCoroutine(slowMotionRoutine);
                slowMotionRoutine = null;
            }

            Time.timeScale = 1f;
            Time.fixedDeltaTime = 0.02f;

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

            if (slowMotionRoutine != null)
                StopCoroutine(slowMotionRoutine);

            slowMotionRoutine = StartCoroutine(ImpactSlowMotion());
        }

        private IEnumerator ImpactSlowMotion()
        {
            float originalScale = Time.timeScale;
            float originalFixedDelta = Time.fixedDeltaTime;

            Time.timeScale = impactSlowMotionScale;
            Time.fixedDeltaTime = originalFixedDelta * impactSlowMotionScale;

            onFallImpact?.Invoke();
            FallImpact?.Invoke();

            yield return new WaitForSecondsRealtime(impactSlowMotionDuration);

            Time.timeScale = originalScale;
            Time.fixedDeltaTime = originalFixedDelta;
            slowMotionRoutine = null;
        }
    }
}
