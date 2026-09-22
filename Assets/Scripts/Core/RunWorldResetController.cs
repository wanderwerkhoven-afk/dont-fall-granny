using UnityEngine;

namespace DontFallGranny.Core
{
    public sealed class RunWorldResetController : MonoBehaviour
    {
        public void ResetWorld()
        {
            MonoBehaviour[] behaviours = FindObjectsByType<MonoBehaviour>(
                FindObjectsInactive.Include,
                FindObjectsSortMode.None
            );

            foreach (MonoBehaviour behaviour in behaviours)
            {
                if (behaviour is IRunResettable resettable)
                    resettable.ResetForRun();
            }
        }
    }
}
