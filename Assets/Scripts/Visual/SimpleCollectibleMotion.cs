using DontFallGranny.UI;
using UnityEngine;

namespace DontFallGranny.Visual
{
    public sealed class SimpleCollectibleMotion : MonoBehaviour
    {
        [SerializeField] private ReducedMotionSettings motionSettings;
        [SerializeField] private float spinDegreesPerSecond = 120f;
        [SerializeField] private float bobAmplitude = 0.12f;
        [SerializeField] private float bobFrequency = 2.2f;

        private Vector3 startLocalPosition;
        private float elapsed;

        private void Awake()
        {
            startLocalPosition = transform.localPosition;

            if (motionSettings == null)
                motionSettings = FindFirstObjectByType<ReducedMotionSettings>();
        }

        private void Update()
        {
            bool reduced = motionSettings != null && motionSettings.ReducedMotion;

            if (!reduced)
            {
                transform.Rotate(
                    Vector3.up,
                    spinDegreesPerSecond * Time.deltaTime,
                    Space.Self
                );

                elapsed += Time.deltaTime;
                Vector3 p = startLocalPosition;
                p.y += Mathf.Sin(elapsed * bobFrequency * Mathf.PI * 2f)
                    * bobAmplitude;
                transform.localPosition = p;
            }
            else
            {
                transform.localPosition = startLocalPosition;
            }
        }
    }
}
