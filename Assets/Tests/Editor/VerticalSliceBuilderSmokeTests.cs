using DontFallGranny.Core;
using DontFallGranny.EditorTools;
using DontFallGranny.Gameplay;
using DontFallGranny.UI;
using NUnit.Framework;
using UnityEngine;
using UnityEngine.EventSystems;

namespace DontFallGranny.Tests
{
    public sealed class VerticalSliceBuilderSmokeTests
    {
        [Test]
        public void Build_CreatesPlayableCoreSceneGraph()
        {
            VerticalSliceBootstrapBuilder.Build();

            Assert.NotNull(GameObject.Find("GrannyPrototype"));
            Assert.NotNull(GameObject.Find("GameCanvas"));
            Assert.NotNull(Object.FindFirstObjectByType<EventSystem>());
            Assert.NotNull(Object.FindFirstObjectByType<RunDataController>());
            Assert.NotNull(Object.FindFirstObjectByType<RunWorldResetController>());
            Assert.NotNull(Object.FindFirstObjectByType<RunHUDController>());
            Assert.NotNull(Object.FindFirstObjectByType<MovingHazard>());
            Assert.NotNull(Object.FindFirstObjectByType<NearMissTrigger>());

            CoinPickup[] coins = Object.FindObjectsByType<CoinPickup>(
                FindObjectsSortMode.None
            );
            Assert.GreaterOrEqual(coins.Length, 3);
        }
    }
}
