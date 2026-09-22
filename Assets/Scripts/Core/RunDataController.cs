using System;
using UnityEngine;

namespace DontFallGranny.Core
{
    public sealed class RunDataController : MonoBehaviour
    {
        [Header("References")]
        [SerializeField] private GameSessionFlowController sessionFlow;
        [SerializeField] private Transform distanceTarget;

        private Vector3 runStartPosition;

        public float DistanceMeters { get; private set; }
        public int Coins { get; private set; }
        public int NearMisses { get; private set; }
        public float BestDistanceMeters { get; private set; }

        public event Action<float> DistanceChanged;
        public event Action<int> CoinsChanged;
        public event Action<int> NearMissChanged;
        public event Action RunDataReset;

        private void Awake()
        {
            if (sessionFlow == null)
                sessionFlow = FindFirstObjectByType<GameSessionFlowController>();

            if (distanceTarget == null)
                distanceTarget = transform;

            runStartPosition = distanceTarget.position;
        }

        private void Update()
        {
            if (sessionFlow != null &&
                sessionFlow.State != GameSessionState.Playing)
            {
                return;
            }

            float nextDistance = Mathf.Max(
                0f,
                distanceTarget.position.z - runStartPosition.z
            );

            if (Mathf.Abs(nextDistance - DistanceMeters) < 0.01f)
                return;

            DistanceMeters = nextDistance;
            BestDistanceMeters = Mathf.Max(BestDistanceMeters, DistanceMeters);
            DistanceChanged?.Invoke(DistanceMeters);
        }

        public void AddCoin(int amount = 1)
        {
            if (amount <= 0)
                return;

            Coins += amount;
            CoinsChanged?.Invoke(Coins);
        }

        public void RegisterNearMiss()
        {
            NearMisses++;
            NearMissChanged?.Invoke(NearMisses);
        }

        public void ResetRunData()
        {
            DistanceMeters = 0f;
            Coins = 0;
            NearMisses = 0;
            runStartPosition = distanceTarget != null
                ? distanceTarget.position
                : transform.position;

            DistanceChanged?.Invoke(DistanceMeters);
            CoinsChanged?.Invoke(Coins);
            NearMissChanged?.Invoke(NearMisses);
            RunDataReset?.Invoke();
        }

        public void CaptureNewStartPosition()
        {
            runStartPosition = distanceTarget != null
                ? distanceTarget.position
                : transform.position;
        }
    }
}
