using DontFallGranny.Core;
using UnityEngine;

namespace DontFallGranny.Gameplay
{
    [RequireComponent(typeof(Collider))]
    public sealed class CoinPickup : MonoBehaviour, IRunResettable
    {
        [SerializeField] private int value = 1;

        private Collider trigger;
        private Renderer visual;
        private bool collected;

        private void Awake()
        {
            trigger = GetComponent<Collider>();
            trigger.isTrigger = true;
            visual = GetComponent<Renderer>();
        }

        private void OnTriggerEnter(Collider other)
        {
            if (collected ||
                other.GetComponentInParent<GrannyRunnerController>() == null)
            {
                return;
            }

            RunDataController runData =
                other.GetComponentInParent<RunDataController>();

            if (runData == null)
                return;

            collected = true;
            runData.AddCoin(value);
            SetAvailable(false);
        }

        public void ResetForRun()
        {
            collected = false;
            SetAvailable(true);
        }

        private void SetAvailable(bool available)
        {
            if (trigger != null)
                trigger.enabled = available;

            if (visual != null)
                visual.enabled = available;
        }
    }
}
