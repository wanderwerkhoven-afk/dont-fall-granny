using DontFallGranny.Core;
using DontFallGranny.UI;
using UnityEngine;

namespace DontFallGranny.Feedback
{
    public sealed class RunnerCameraFeelController : MonoBehaviour
    {
        [Header("References")]
        [SerializeField] private Camera targetCamera;
        [SerializeField] private Transform followTarget;
        [SerializeField] private GameRunStateController runState;
        [SerializeField] private BalanceController balance;
        [SerializeField] private ReducedMotionSettings motionSettings;

        [Header("Base framing")]
        [SerializeField] private Vector3 baseOffset =
            new Vector3(4.6f, 2.8f, -7.5f);
        [SerializeField] private Vector3 lookOffset =
            new Vector3(0f, 1.15f, 2.4f);
        [SerializeField] private float baseFov = 58f;

        [Header("Tension framing")]
        [SerializeField] private float unstableFov = 55f;
        [SerializeField] private float criticalFov = 51f;
        [SerializeField] private float recoveringFov = 49f;
        [SerializeField] private float rescueFov = 45f;
        [SerializeField] private float recoveringHeightOffset = 0.25f;
        [SerializeField] private float followSharpness = 8f;
        [SerializeField] private float rotationSharpness = 10f;
        [SerializeField] private float fovSharpness = 8f;

        [Header("Procedural motion")]
        [SerializeField] private float recoverySwayAmplitude = 0.08f;
        [SerializeField] private float recoverySwayFrequency = 5.5f;
        [SerializeField] private float fallenDip = 0.28f;
        [SerializeField] private float fallenRollDegrees = 3.5f;

        private float motionTime;

        private void Awake()
        {
            if (targetCamera == null)
                targetCamera = GetComponent<Camera>();

            if (motionSettings == null)
                motionSettings = FindFirstObjectByType<ReducedMotionSettings>();
        }

        private void LateUpdate()
        {
            if (targetCamera == null || followTarget == null)
                return;

            bool reduced =
                motionSettings != null && motionSettings.ReducedMotion;

            float targetFov = ResolveTargetFov();
            float verticalTension =
                runState != null &&
                runState.State == GameRunState.Recovering
                    ? recoveringHeightOffset
                    : 0f;

            Vector3 proceduralOffset = Vector3.zero;
            float roll = 0f;

            if (!reduced && runState != null)
            {
                motionTime += Time.unscaledDeltaTime;

                if (runState.State == GameRunState.Recovering)
                {
                    proceduralOffset.x =
                        Mathf.Sin(
                            motionTime *
                            recoverySwayFrequency *
                            Mathf.PI * 2f
                        ) * recoverySwayAmplitude;
                }
                else if (runState.State == GameRunState.Fallen ||
                         runState.State == GameRunState.Rescue)
                {
                    proceduralOffset.y = -fallenDip;
                    roll = fallenRollDegrees;
                }
            }

            Vector3 desiredPosition =
                followTarget.position +
                baseOffset +
                Vector3.up * verticalTension +
                proceduralOffset;

            transform.position = Vector3.Lerp(
                transform.position,
                desiredPosition,
                1f - Mathf.Exp(-followSharpness * Time.unscaledDeltaTime)
            );

            Vector3 lookPoint = followTarget.position + lookOffset;
            Quaternion desiredRotation = Quaternion.LookRotation(
                lookPoint - transform.position,
                Vector3.up
            ) * Quaternion.Euler(0f, 0f, roll);

            transform.rotation = Quaternion.Slerp(
                transform.rotation,
                desiredRotation,
                1f - Mathf.Exp(-rotationSharpness * Time.unscaledDeltaTime)
            );

            targetCamera.fieldOfView = Mathf.Lerp(
                targetCamera.fieldOfView,
                targetFov,
                1f - Mathf.Exp(-fovSharpness * Time.unscaledDeltaTime)
            );
        }

        private float ResolveTargetFov()
        {
            if (runState != null)
            {
                if (runState.State == GameRunState.Rescue ||
                    runState.State == GameRunState.GameOver)
                {
                    return rescueFov;
                }

                if (runState.State == GameRunState.Recovering)
                    return recoveringFov;
            }

            if (balance != null)
            {
                if (balance.State == BalanceState.Critical)
                    return criticalFov;

                if (balance.State == BalanceState.Unstable)
                    return unstableFov;
            }

            return baseFov;
        }
    }
}
