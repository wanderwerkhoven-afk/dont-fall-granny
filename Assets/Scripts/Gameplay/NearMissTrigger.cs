using System;
using DontFallGranny.Core;
using UnityEngine;
using UnityEngine.Events;

namespace DontFallGranny.Gameplay
{
    [RequireComponent(typeof(Collider))]
    public sealed class NearMissTrigger : MonoBehaviour, IRunResettable
    {
        [SerializeField] private UnityEvent onNearMiss;

        private bool grannyInside;
        private bool hitRegistered;

        public event Action NearMiss;

        private void Awake()
        {
            Collider trigger = GetComponent<Collider>();
            trigger.isTrigger = true;
        }

        public void MarkHit()
        {
            hitRegistered = true;
        }

        private void OnTriggerEnter(Collider other)
        {
            if (other.GetComponentInParent<GrannyRunnerController>() != null)
                grannyInside = true;
        }

        private void OnTriggerExit(Collider other)
        {
            GrannyRunnerController runner =
                other.GetComponentInParent<GrannyRunnerController>();

            if (!grannyInside || runner == null)
                return;

            grannyInside = false;

            if (hitRegistered)
            {
                hitRegistered = false;
                return;
            }

            RunDataController runData =
                other.GetComponentInParent<RunDataController>();
            runData?.RegisterNearMiss();

            onNearMiss?.Invoke();
            NearMiss?.Invoke();
        }

        public void ResetForRun()
        {
            grannyInside = false;
            hitRegistered = false;
        }
    }
}
