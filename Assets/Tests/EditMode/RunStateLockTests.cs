using DontFallGranny.Core;
using NUnit.Framework;
using UnityEngine;

namespace DontFallGranny.Tests
{
    public sealed class RunStateLockTests
    {
        [TestCase(GameRunState.Fallen)]
        [TestCase(GameRunState.Rescue)]
        [TestCase(GameRunState.GameOver)]
        public void FailureStates_BlockLocomotion(GameRunState state)
        {
            var root = new GameObject("RunStateLockTests");
            var controller = root.AddComponent<GameRunStateController>();

            controller.SetState(state);

            Assert.IsFalse(controller.AllowsLocomotion);
            Object.DestroyImmediate(root);
        }
    }
}
