using DontFallGranny.Core;
using UnityEngine;

namespace DontFallGranny.Gameplay
{
    [RequireComponent(typeof(Collider))]
    public sealed class CoinPickup : MonoBehaviour
    {
        [SerializeField] private int value = 1;

        private void Awake()
        {
            Collider trigger = GetComponent<Collider>();
            trigger.isTrigger = true;
        }

        private void OnTriggerEnter(Collider other)
        {
            if (other.GetComponentInParent<GrannyRunnerController>() == null)
                return;

            RunDataController runData =
                other.GetComponentInParent<RunDataController>();

            if (runData == null)
                return;

            runData.AddCoin(value);
            gameObject.SetActive(false);
        }
    }
}
