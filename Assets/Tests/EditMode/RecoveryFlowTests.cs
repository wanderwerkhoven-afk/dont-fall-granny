using DontFallGranny.Core;
using NUnit.Framework;
using UnityEngine;

namespace DontFallGranny.Tests
{
    public sealed class RecoveryFlowTests
    {
        private GameObject root;
        private BalanceController balance;
        private GameRunStateController runState;
        private RecoveryWindowController recovery;
        private GrannyImpactReceiver receiver;

        [SetUp]
        public void SetUp()
        {
            root = new GameObject("RecoveryFlowTests");
            balance = root.AddComponent<BalanceController>();
            runState = root.AddComponent<GameRunStateController>();
            recovery = root.AddComponent<RecoveryWindowController>();
            receiver = root.AddComponent<GrannyImpactReceiver>();
        }

        [TearDown]
        public void TearDown()
        {
            Object.DestroyImmediate(root);
        }

        [Test]
        public void BeginRecovery_ChangesRunState()
        {
            recovery.BeginRecovery(false);

            Assert.IsTrue(recovery.IsRecovering);
            Assert.AreEqual(GameRunState.Recovering, runState.State);
        }

        [Test]
        public void SuccessfulRecovery_ReturnsToRunning()
        {
            balance.ApplyImpact(0.5f);
            recovery.BeginRecovery(false);
            recovery.AttemptRecovery();

            Assert.IsFalse(recovery.IsRecovering);
            Assert.AreEqual(GameRunState.Running, runState.State);
            Assert.Greater(balance.Balance, 0.5f);
        }

        [Test]
        public void HeavyImpactDuringRecovery_ForcesFall()
        {
            recovery.BeginRecovery(false);

            receiver.ReceiveImpact(0.2f, true, Vector3.zero);

            Assert.IsFalse(recovery.IsRecovering);
            Assert.AreEqual(BalanceState.Fallen, balance.State);
        }
    }
}
