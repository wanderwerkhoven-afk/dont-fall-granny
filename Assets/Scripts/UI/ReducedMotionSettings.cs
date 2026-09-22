using System;
using UnityEngine;

namespace DontFallGranny.UI
{
    public sealed class ReducedMotionSettings : MonoBehaviour
    {
        [SerializeField] private bool reducedMotion;

        public bool ReducedMotion => reducedMotion;
        public event Action<bool> Changed;

        public void SetReducedMotion(bool enabled)
        {
            if (reducedMotion == enabled)
                return;

            reducedMotion = enabled;
            Changed?.Invoke(reducedMotion);
        }
    }
}
