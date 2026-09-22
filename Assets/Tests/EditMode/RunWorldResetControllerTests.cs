using DontFallGranny.Core;
using NUnit.Framework;
using UnityEngine;

namespace DontFallGranny.Tests
{
    public sealed class RunWorldResetControllerTests
    {
        private sealed class ResetProbe : MonoBehaviour, IRunResettable
        {
            public int Count { get; private set; }

            public void ResetForRun()
            {
                Count++;
            }
        }

        [Test]
        public void ResetWorld_ResetsRegisteredWorldObjects()
        {
            var coordinatorObject = new GameObject("WorldReset");
            var probeObject = new GameObject("Probe");

            var coordinator =
                coordinatorObject.AddComponent<RunWorldResetController>();
            var probe = probeObject.AddComponent<ResetProbe>();

            coordinator.ResetWorld();

            Assert.AreEqual(1, probe.Count);

            Object.DestroyImmediate(probeObject);
            Object.DestroyImmediate(coordinatorObject);
        }
    }
}
