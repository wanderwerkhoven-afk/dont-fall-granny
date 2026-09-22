using DontFallGranny.Core;
using NUnit.Framework;
using UnityEngine;

namespace DontFallGranny.Tests
{
    public sealed class GameRunStateControllerTests
    {
        [TestCase(GameRunState.Running, true)]
        [TestCase(GameRunState.Recovering, true)]
        [TestCase(GameRunState.Fallen, false)]
        [TestCase(GameRunState.Rescue, false)]
        [TestCase(GameRunState.GameOver, false)]
        public void AllowsLocomotion_MatchesState(GameRunState state, bool expected)
        {
            var root = new GameObject("RunStateTests");
            var controller = root.AddComponent<GameRunStateController>();

            controller.SetState(state);

            Assert.AreEqual(expected, controller.AllowsLocomotion);
            Object.DestroyImmediate(root);
        }
    }
}
