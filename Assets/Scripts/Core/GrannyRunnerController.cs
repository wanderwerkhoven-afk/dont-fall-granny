using DontFallGranny.Input;
using UnityEngine;

namespace DontFallGranny.Core
{
    [RequireComponent(typeof(Rigidbody))]
    public sealed class GrannyRunnerController : MonoBehaviour
    {
        [Header("References")]
        [SerializeField] private BalanceController balanceController;
        [SerializeField] private GameRunStateController runState;
        [SerializeField] private GameSessionFlowController sessionFlow;
        [SerializeField] private GrannyInputRouter inputRouter;
        [SerializeField] private Transform groundProbe;
        [SerializeField] private LayerMask groundMask = ~0;

        [Header("Running")]
        [SerializeField] private float forwardSpeed = 6.5f;
        [SerializeField] private float acceleration = 0.08f;
        [SerializeField] private float maxForwardSpeed = 11f;
        [SerializeField, Range(0f, 1f)] private float recoveringSpeedMultiplier = 0.45f;

        [Header("Jump")]
        [SerializeField] private float jumpVelocity = 7.4f;
        [SerializeField] private float coyoteTime = 0.11f;
        [SerializeField] private float jumpBufferTime = 0.13f;
        [SerializeField] private float groundProbeRadius = 0.22f;

        [Header("Landing")]
        [SerializeField] private float hardLandingVelocity = 8.5f;
        [SerializeField] private float hardLandingBalanceDamage = 0.18f;

        private Rigidbody body;
        private float elapsed;
        private float lastGroundedTime = float.NegativeInfinity;
        private float lastJumpRequestTime = float.NegativeInfinity;
        private float previousVerticalVelocity;
        private bool wasGrounded;

        public float CurrentSpeed { get; private set; }
        public bool IsGrounded { get; private set; }
        public bool SessionAllowsGameplay =>
            sessionFlow == null || sessionFlow.State == GameSessionState.Playing;

        private bool AllowsLocomotion =>
            SessionAllowsGameplay &&
            (runState == null || runState.AllowsLocomotion);

        private bool AllowsJump =>
            SessionAllowsGameplay &&
            (runState == null || runState.State == GameRunState.Running);

        private void Awake()
        {
            body = GetComponent<Rigidbody>();
            CurrentSpeed = forwardSpeed;

            if (balanceController == null)
                balanceController = GetComponent<BalanceController>();

            if (runState == null)
                runState = GetComponent<GameRunStateController>();

            if (sessionFlow == null)
                sessionFlow = FindFirstObjectByType<GameSessionFlowController>();

            if (inputRouter == null)
                inputRouter = GetComponent<GrannyInputRouter>();
        }

        private void OnEnable()
        {
            if (inputRouter != null)
                inputRouter.JumpRequested += RequestJump;
        }

        private void OnDisable()
        {
            if (inputRouter != null)
                inputRouter.JumpRequested -= RequestJump;
        }

        private void Update()
        {
            if (!AllowsLocomotion)
            {
                previousVerticalVelocity = body.linearVelocity.y;
                wasGrounded = IsGrounded;
                return;
            }

            elapsed += Time.deltaTime;
            CurrentSpeed = Mathf.Min(
                maxForwardSpeed,
                forwardSpeed + elapsed * acceleration
            );

            UpdateGroundedState();
            TryConsumeJump();
            DetectHardLanding();

            previousVerticalVelocity = body.linearVelocity.y;
            wasGrounded = IsGrounded;
        }

        private void FixedUpdate()
        {
            if (!AllowsLocomotion)
            {
                Vector3 stopped = body.linearVelocity;
                stopped.z = 0f;
                body.linearVelocity = stopped;
                return;
            }

            float stateMultiplier =
                runState != null && runState.State == GameRunState.Recovering
                    ? recoveringSpeedMultiplier
                    : 1f;

            Vector3 velocity = body.linearVelocity;
            velocity.z = CurrentSpeed * stateMultiplier;
            body.linearVelocity = velocity;
        }

        public void ResetRunMotion()
        {
            elapsed = 0f;
            CurrentSpeed = forwardSpeed;
            lastGroundedTime = float.NegativeInfinity;
            lastJumpRequestTime = float.NegativeInfinity;
        }

        public void RequestJump()
        {
            if (!AllowsJump)
                return;

            lastJumpRequestTime = Time.time;
        }

        public void ApplyObstacleImpact(float severity)
        {
            if (!SessionAllowsGameplay)
                return;

            balanceController?.ApplyImpact(severity);
        }

        public void ApplyRecovery(float amount)
        {
            if (!SessionAllowsGameplay)
                return;

            balanceController?.Recover(amount);
        }

        private void UpdateGroundedState()
        {
            Vector3 probePosition = groundProbe != null
                ? groundProbe.position
                : transform.position + Vector3.down * 0.9f;

            IsGrounded = Physics.CheckSphere(
                probePosition,
                groundProbeRadius,
                groundMask,
                QueryTriggerInteraction.Ignore
            );

            if (IsGrounded)
                lastGroundedTime = Time.time;
        }

        private void TryConsumeJump()
        {
            if (!AllowsJump)
                return;

            bool buffered = Time.time - lastJumpRequestTime <= jumpBufferTime;
            bool canUseGround = Time.time - lastGroundedTime <= coyoteTime;

            if (!buffered || !canUseGround)
                return;

            Vector3 velocity = body.linearVelocity;
            velocity.y = jumpVelocity;
            body.linearVelocity = velocity;

            lastJumpRequestTime = float.NegativeInfinity;
            lastGroundedTime = float.NegativeInfinity;
            IsGrounded = false;
        }

        private void DetectHardLanding()
        {
            if (!wasGrounded &&
                IsGrounded &&
                previousVerticalVelocity <= -hardLandingVelocity)
            {
                float excess = Mathf.Abs(previousVerticalVelocity) - hardLandingVelocity;
                float scaledDamage = hardLandingBalanceDamage + excess * 0.025f;
                balanceController?.ApplyImpact(scaledDamage);
            }
        }

#if UNITY_EDITOR
        private void OnDrawGizmosSelected()
        {
            Vector3 probePosition = groundProbe != null
                ? groundProbe.position
                : transform.position + Vector3.down * 0.9f;

            Gizmos.DrawWireSphere(probePosition, groundProbeRadius);
        }
#endif
    }
}
