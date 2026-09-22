using DontFallGranny.Core;
using NUnit.Framework;
using UnityEngine;

namespace DontFallGranny.Tests
{
    public sealed class BalanceControllerTests
    {
        private GameObject root;
        private BalanceController balance;

        [SetUp]
        public void SetUp()
        {
            root = new GameObject("BalanceControllerTests");
            balance = root.AddComponent<BalanceController>();
        }

        [TearDown]
        public void TearDown()
        {
            Object.DestroyImmediate(root);
        }

        [Test]
        public void Impact_TransitionsStableToUnstable()
        {
            balance.ApplyImpact(0.5f);
            Assert.AreEqual(BalanceState.Unstable, balance.State);
        }

        [Test]
        public void Impact_TransitionsToCritical()
        {
            balance.ApplyImpact(0.8f);
            Assert.AreEqual(BalanceState.Critical, balance.State);
        }

        [Test]
        public void FatalImpact_TransitionsToFallen()
        {
            balance.ApplyImpact(1f);
            Assert.AreEqual(BalanceState.Fallen, balance.State);
        }

        [Test]
        public void ResetBalance_ReturnsToStable()
        {
            balance.ApplyImpact(1f);
            balance.ResetBalance();

            Assert.AreEqual(BalanceState.Stable, balance.State);
            Assert.AreEqual(1f, balance.Balance, 0.0001f);
        }
    }
}
