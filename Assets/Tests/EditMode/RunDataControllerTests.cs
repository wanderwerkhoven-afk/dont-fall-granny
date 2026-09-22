using DontFallGranny.Core;
using NUnit.Framework;
using UnityEngine;

namespace DontFallGranny.Tests
{
    public sealed class RunDataControllerTests
    {
        [Test]
        public void AddCoin_EmitsUpdatedTotal()
        {
            var root = new GameObject("RunDataTests");
            var data = root.AddComponent<RunDataController>();
            int observed = -1;

            data.CoinsChanged += value => observed = value;
            data.AddCoin(2);

            Assert.AreEqual(2, data.Coins);
            Assert.AreEqual(2, observed);

            Object.DestroyImmediate(root);
        }

        [Test]
        public void ResetRunData_ClearsCurrentRunButKeepsObjectValid()
        {
            var root = new GameObject("RunDataTests");
            var data = root.AddComponent<RunDataController>();

            data.AddCoin(3);
            data.ResetRunData();

            Assert.AreEqual(0, data.Coins);
            Assert.AreEqual(0f, data.DistanceMeters, 0.001f);

            Object.DestroyImmediate(root);
        }
    }
}
