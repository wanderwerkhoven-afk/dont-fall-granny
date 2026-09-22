using DontFallGranny.Core;
using NUnit.Framework;
using UnityEngine;

namespace DontFallGranny.Tests
{
    public sealed class RescueFlowTests
    {
        private GameObject root;
        private BalanceController balance;
        private GameRunStateController runState;
        private FallController fall;
        private RescueWindowController rescue;

        [SetUp]
        public void SetUp()
        {
            root = new GameObject("RescueFlowTests");
            root.AddComponent<Rigidbody>();
            balance = root.AddComponent<BalanceController>();
            runState = root.AddComponent<GameRunStateController>();
            root.AddComponent<GameTimeController>();
            fall = root.AddComponent<FallController>();
            rescue = root.AddComponent<RescueWindowController>();
        }

        [TearDown]
        public void TearDown()
        {
            Time.timeScale = 1f;
            Time.fixedDeltaTime = 0.02f;
            Object.DestroyImmediate(root);
        }

        [Test]
        public void Open_EntersRescueState()
        {
            rescue.Open();

            Assert.IsTrue(rescue.IsOpen);
            Assert.AreEqual(GameRunState.Rescue, runState.State);
        }

        [Test]
        public void Expire_EntersGameOverState()
        {
            rescue.Open();
            rescue.Expire();

            Assert.IsFalse(rescue.IsOpen);
            Assert.AreEqual(GameRunState.GameOver, runState.State);
        }

        [Test]
        public void Rescue_ResetsBalanceAndReturnsToRunning()
        {
            balance.ApplyImpact(0.6f);
            rescue.Open();
            rescue.Rescue();

            Assert.IsFalse(rescue.IsOpen);
            Assert.AreEqual(GameRunState.Running, runState.State);
            Assert.AreEqual(BalanceState.Stable, balance.State);
            Assert.AreEqual(1f, balance.Balance, 0.0001f);
        }
    }
}
