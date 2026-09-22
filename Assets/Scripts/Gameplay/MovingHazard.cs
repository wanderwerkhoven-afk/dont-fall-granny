using DontFallGranny.Core;
using UnityEngine;

namespace DontFallGranny.Gameplay
{
    public sealed class MovingHazard : MonoBehaviour, IRunResettable
    {
        [SerializeField] private Vector3 localAxis = Vector3.right;
        [SerializeField] private float amplitude = 1.4f;
        [SerializeField] private float cyclesPerSecond = 0.55f;

        private Vector3 startLocalPosition;
        private float phase;

        private void Awake()
        {
            startLocalPosition = transform.localPosition;
        }

        private void Update()
        {
            phase += Time.deltaTime * cyclesPerSecond * Mathf.PI * 2f;
            transform.localPosition =
                startLocalPosition +
                localAxis.normalized * Mathf.Sin(phase) * amplitude;
        }

        public void ResetForRun()
        {
            phase = 0f;
            transform.localPosition = startLocalPosition;
        }
    }
}
