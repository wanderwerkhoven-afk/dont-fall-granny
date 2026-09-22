using UnityEngine;

namespace DontFallGranny.Core
{
    [RequireComponent(typeof(Collider))]
    public sealed class ObstacleImpactSource : MonoBehaviour
    {
        [Header("Impact")]
        [SerializeField, Range(0.01f, 1f)] private float balanceDamage = 0.28f;
        [SerializeField] private bool heavyImpact;
        [SerializeField] private float cooldownSeconds = 0.35f;

        private float lastImpactTime = float.NegativeInfinity;

        public float BalanceDamage => balanceDamage;
        public bool HeavyImpact => heavyImpact;

        private void OnTriggerEnter(Collider other)
        {
            TryHit(other);
        }

        private void OnCollisionEnter(Collision collision)
        {
            TryHit(collision.collider);
        }

        private void TryHit(Collider other)
        {
            if (Time.time - lastImpactTime < cooldownSeconds)
                return;

            GrannyImpactReceiver receiver = other.GetComponentInParent<GrannyImpactReceiver>();
            if (receiver == null)
                return;

            lastImpactTime = Time.time;
            receiver.ReceiveImpact(balanceDamage, heavyImpact, transform.position);
        }
    }
}
