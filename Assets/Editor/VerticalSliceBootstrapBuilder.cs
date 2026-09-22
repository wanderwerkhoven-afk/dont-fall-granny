using DontFallGranny.Core;
using DontFallGranny.Feedback;
using DontFallGranny.Gameplay;
using DontFallGranny.Input;
using DontFallGranny.UI;
using DontFallGranny.Visual;
using TMPro;
using UnityEditor;
using UnityEditor.Events;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.InputSystem.UI;
using UnityEngine.SceneManagement;
using UnityEngine.UI;

namespace DontFallGranny.EditorTools
{
    public static class VerticalSliceBootstrapBuilder
    {
        private const string ScenePath = "Assets/Scenes/VerticalSlice.unity";
        private const string PrefabPath = "Assets/Prefabs/GrannyPrototype.prefab";
        private const string MaterialFolder = "Assets/Art/Materials";
        private const string ProfilePath = "Assets/Art/VisualDirectionProfile.asset";

        [MenuItem("Don’t Fall Granny/Build Vertical Slice Prototype")]
        public static void Build()
        {
            EnsureFolders();
            VisualDirectionProfile profile = GetOrCreateVisualProfile();
            MaterialSet materials = CreateMaterials(profile);

            Scene scene = EditorSceneManager.NewScene(
                NewSceneSetup.EmptyScene,
                NewSceneMode.Single
            );

            GameObject systems = BuildSystems();
            GameObject granny = BuildGrannyPrototype(materials);
            BuildStreet(materials);
            BuildLighting();
            BuildCamera(granny, systems);
            BuildUI(systems, granny, materials);

            PrefabUtility.SaveAsPrefabAssetAndConnect(
                granny,
                PrefabPath,
                InteractionMode.AutomatedAction
            );

            EditorSceneManager.SaveScene(scene, ScenePath);
            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();

            Selection.activeGameObject = granny;
            Debug.Log($"Don’t Fall Granny vertical slice prototype created: {ScenePath}");
        }

        private static void EnsureFolders()
        {
            EnsureFolder("Assets", "Scenes");
            EnsureFolder("Assets", "Prefabs");
            EnsureFolder("Assets", "Art");
            EnsureFolder("Assets/Art", "Materials");
        }

        private static void EnsureFolder(string parent, string child)
        {
            string path = $"{parent}/{child}";
            if (!AssetDatabase.IsValidFolder(path))
                AssetDatabase.CreateFolder(parent, child);
        }

        private static VisualDirectionProfile GetOrCreateVisualProfile()
        {
            var profile = AssetDatabase.LoadAssetAtPath<VisualDirectionProfile>(ProfilePath);
            if (profile != null)
                return profile;

            profile = ScriptableObject.CreateInstance<VisualDirectionProfile>();
            AssetDatabase.CreateAsset(profile, ProfilePath);
            return profile;
        }

        private static MaterialSet CreateMaterials(VisualDirectionProfile profile)
        {
            return new MaterialSet
            {
                Cream = GetOrCreateMaterial("Cream", profile.cream),
                Plum = GetOrCreateMaterial("Plum", profile.plum),
                Mustard = GetOrCreateMaterial("Mustard", profile.mustard),
                DustyPink = GetOrCreateMaterial("DustyPink", profile.dustyPink),
                Mint = GetOrCreateMaterial("Mint", profile.mint),
                Asphalt = GetOrCreateMaterial("Asphalt", new Color(0.17f, 0.18f, 0.22f)),
                Grass = GetOrCreateMaterial("Grass", new Color(0.42f, 0.62f, 0.43f)),
                White = GetOrCreateMaterial("White", new Color(0.94f, 0.93f, 0.90f))
            };
        }

        private static Material GetOrCreateMaterial(string name, Color color)
        {
            string path = $"{MaterialFolder}/{name}.mat";
            Material material = AssetDatabase.LoadAssetAtPath<Material>(path);

            if (material == null)
            {
                Shader shader = Shader.Find("Universal Render Pipeline/Lit");
                if (shader == null)
                    shader = Shader.Find("Standard");

                material = new Material(shader) { name = name };
                AssetDatabase.CreateAsset(material, path);
            }

            material.color = color;
            EditorUtility.SetDirty(material);
            return material;
        }

        private static GameObject BuildSystems()
        {
            var systems = new GameObject("GameSystems");
            systems.AddComponent<GameSessionFlowController>();
            systems.AddComponent<RunWorldResetController>();
            systems.AddComponent<ReducedMotionSettings>();
            return systems;
        }

        private static GameObject BuildGrannyPrototype(MaterialSet m)
        {
            var root = new GameObject("GrannyPrototype");
            root.transform.position = new Vector3(0f, 1f, 0f);

            var body = root.AddComponent<Rigidbody>();
            body.mass = 1.2f;
            body.constraints = RigidbodyConstraints.FreezeRotationX |
                               RigidbodyConstraints.FreezeRotationZ;

            var capsule = root.AddComponent<CapsuleCollider>();
            capsule.height = 1.8f;
            capsule.radius = 0.42f;

            root.AddComponent<BalanceController>();
            root.AddComponent<GameRunStateController>();
            root.AddComponent<GameTimeController>();
            root.AddComponent<GrannyInputRouter>();
            root.AddComponent<GrannyRunnerController>();
            root.AddComponent<RecoveryWindowController>();
            root.AddComponent<GrannyImpactReceiver>();
            root.AddComponent<FallController>();
            root.AddComponent<RescueWindowController>();
            root.AddComponent<TensionFeedbackSystem>();
            root.AddComponent<RunDataController>();
            root.AddComponent<GameRunLifecycleController>();

            CreatePrimitiveChild(root.transform, PrimitiveType.Sphere, "Head",
                new Vector3(0f, 0.95f, 0f), new Vector3(0.68f, 0.68f, 0.68f), m.Cream);
            CreatePrimitiveChild(root.transform, PrimitiveType.Capsule, "Coat",
                new Vector3(0f, 0.15f, 0f), new Vector3(0.82f, 0.82f, 0.82f), m.DustyPink);
            CreatePrimitiveChild(root.transform, PrimitiveType.Sphere, "Hair",
                new Vector3(0f, 1.22f, -0.04f), new Vector3(0.76f, 0.34f, 0.76f), m.White);

            BuildGlasses(root.transform, m);
            return root;
        }

        private static void BuildGlasses(Transform root, MaterialSet m)
        {
            var glasses = new GameObject("Glasses");
            glasses.transform.SetParent(root);
            glasses.transform.localPosition = new Vector3(0f, 1.02f, 0.31f);

            for (int side = -1; side <= 1; side += 2)
            {
                GameObject lens = CreatePrimitiveChild(
                    glasses.transform,
                    PrimitiveType.Cylinder,
                    side < 0 ? "Lens_L" : "Lens_R",
                    new Vector3(side * 0.19f, 0f, 0f),
                    new Vector3(0.17f, 0.02f, 0.17f),
                    m.Plum
                );
                lens.transform.localRotation = Quaternion.Euler(90f, 0f, 0f);
            }

            CreatePrimitiveChild(glasses.transform, PrimitiveType.Cube, "Bridge",
                Vector3.zero, new Vector3(0.16f, 0.035f, 0.035f), m.Plum);
        }

        private static void BuildStreet(MaterialSet m)
        {
            var environment = new GameObject("SuburbanStreet");

            GameObject road = GameObject.CreatePrimitive(PrimitiveType.Cube);
            road.name = "Road";
            road.transform.SetParent(environment.transform);
            road.transform.position = new Vector3(0f, -0.25f, 45f);
            road.transform.localScale = new Vector3(8f, 0.5f, 100f);
            road.GetComponent<Renderer>().sharedMaterial = m.Asphalt;

            for (int side = -1; side <= 1; side += 2)
            {
                GameObject grass = GameObject.CreatePrimitive(PrimitiveType.Cube);
                grass.name = side < 0 ? "Grass_Left" : "Grass_Right";
                grass.transform.SetParent(environment.transform);
                grass.transform.position = new Vector3(side * 8f, -0.3f, 45f);
                grass.transform.localScale = new Vector3(8f, 0.4f, 100f);
                grass.GetComponent<Renderer>().sharedMaterial = m.Grass;

                for (int i = 0; i < 6; i++)
                {
                    float z = 12f + i * 16f;
                    BuildHouse(
                        environment.transform,
                        new Vector3(side * 10f, 1.4f, z),
                        m,
                        i + (side > 0 ? 6 : 0)
                    );
                }
            }

            BuildHazard(
                environment.transform,
                "TripHazard",
                new Vector3(0f, 0.18f, 18f),
                new Vector3(1.8f, 0.32f, 0.55f),
                m.Mustard,
                0.18f,
                false,
                false
            );

            BuildHazard(
                environment.transform,
                "HeavyHazard",
                new Vector3(1.25f, 0.8f, 31f),
                new Vector3(1.15f, 1.6f, 0.9f),
                m.DustyPink,
                0.55f,
                true,
                false
            );

            BuildHazard(
                environment.transform,
                "MovingHazard",
                new Vector3(-0.8f, 0.6f, 45f),
                new Vector3(0.9f, 1.2f, 0.8f),
                m.Mint,
                0.30f,
                false,
                true
            );

            BuildCoin(environment.transform, new Vector3(0f, 0.7f, 8f), m.Mustard);
            BuildCoin(environment.transform, new Vector3(0f, 0.7f, 11f), m.Mustard);
            BuildCoin(environment.transform, new Vector3(0f, 0.7f, 14f), m.Mustard);
        }

        private static void BuildHouse(Transform parent, Vector3 position, MaterialSet m, int index)
        {
            GameObject house = GameObject.CreatePrimitive(PrimitiveType.Cube);
            house.name = $"House_{index:00}";
            house.transform.SetParent(parent);
            house.transform.position = position;
            house.transform.localScale = new Vector3(5f, 2.8f, 5f);
            house.GetComponent<Renderer>().sharedMaterial =
                index % 2 == 0 ? m.Cream : m.DustyPink;

            GameObject roof = GameObject.CreatePrimitive(PrimitiveType.Cube);
            roof.name = "Roof";
            roof.transform.SetParent(house.transform);
            roof.transform.localPosition = new Vector3(0f, 0.65f, 0f);
            roof.transform.localRotation = Quaternion.Euler(0f, 0f, 45f);
            roof.transform.localScale = new Vector3(0.75f, 0.75f, 1.05f);
            roof.GetComponent<Renderer>().sharedMaterial = m.Plum;
        }

        private static void BuildHazard(
            Transform parent,
            string name,
            Vector3 position,
            Vector3 scale,
            Material material,
            float damage,
            bool heavy,
            bool moving
        )
        {
            GameObject obstacle = GameObject.CreatePrimitive(PrimitiveType.Cube);
            obstacle.name = name;
            obstacle.transform.SetParent(parent);
            obstacle.transform.position = position;
            obstacle.transform.localScale = scale;
            obstacle.GetComponent<Renderer>().sharedMaterial = material;

            var source = obstacle.AddComponent<ObstacleImpactSource>();

            GameObject nearMissObject = new GameObject($"{name}_NearMiss");
            nearMissObject.transform.SetParent(obstacle.transform, false);

            var nearMissCollider = nearMissObject.AddComponent<BoxCollider>();
            nearMissCollider.isTrigger = true;
            nearMissCollider.size = new Vector3(2.2f, 1.35f, 2.4f);

            var nearMiss = nearMissObject.AddComponent<NearMissTrigger>();

            var sourceSO = new SerializedObject(source);
            sourceSO.FindProperty("balanceDamage").floatValue = damage;
            sourceSO.FindProperty("heavyImpact").boolValue = heavy;
            sourceSO.FindProperty("nearMissTrigger").objectReferenceValue = nearMiss;
            sourceSO.ApplyModifiedPropertiesWithoutUndo();

            if (moving)
                obstacle.AddComponent<MovingHazard>();
        }

        private static void BuildCoin(
            Transform parent,
            Vector3 position,
            Material material
        )
        {
            GameObject coin = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
            coin.name = "CoinPickup";
            coin.transform.SetParent(parent);
            coin.transform.position = position;
            coin.transform.localScale = new Vector3(0.35f, 0.08f, 0.35f);
            coin.transform.rotation = Quaternion.Euler(90f, 0f, 0f);
            coin.GetComponent<Renderer>().sharedMaterial = material;
            coin.AddComponent<CoinPickup>();
            coin.AddComponent<SimpleCollectibleMotion>();
        }

        private static void BuildLighting()
        {
            GameObject lightObject = new GameObject("Sun");
            var light = lightObject.AddComponent<Light>();
            light.type = LightType.Directional;
            light.intensity = 1.15f;
            light.color = new Color(1f, 0.91f, 0.78f);
            lightObject.transform.rotation = Quaternion.Euler(42f, -28f, 0f);

            RenderSettings.ambientMode = UnityEngine.Rendering.AmbientMode.Trilight;
            RenderSettings.ambientSkyColor = new Color(0.62f, 0.76f, 0.86f);
            RenderSettings.ambientEquatorColor = new Color(0.67f, 0.62f, 0.58f);
            RenderSettings.ambientGroundColor = new Color(0.31f, 0.31f, 0.34f);
        }

        private static void BuildCamera(GameObject granny, GameObject systems)
        {
            GameObject cameraObject = new GameObject("Main Camera");
            cameraObject.tag = "MainCamera";

            var camera = cameraObject.AddComponent<Camera>();
            camera.fieldOfView = 58f;

            var feel = cameraObject.AddComponent<RunnerCameraFeelController>();
            var so = new SerializedObject(feel);
            so.FindProperty("targetCamera").objectReferenceValue = camera;
            so.FindProperty("followTarget").objectReferenceValue = granny.transform;
            so.FindProperty("runState").objectReferenceValue =
                granny.GetComponent<GameRunStateController>();
            so.FindProperty("balance").objectReferenceValue =
                granny.GetComponent<BalanceController>();
            so.FindProperty("motionSettings").objectReferenceValue =
                systems.GetComponent<ReducedMotionSettings>();
            so.ApplyModifiedPropertiesWithoutUndo();

            cameraObject.transform.position =
                granny.transform.position + new Vector3(4.6f, 2.8f, -7.5f);
        }

        private static void BuildUI(GameObject systems, GameObject granny, MaterialSet m)
        {
            BuildEventSystem();

            GameObject canvasObject = new GameObject("GameCanvas");
            canvasObject.SetActive(false);

            var canvas = canvasObject.AddComponent<Canvas>();
            canvas.renderMode = RenderMode.ScreenSpaceOverlay;
            var scaler = canvasObject.AddComponent<CanvasScaler>();
            scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
            scaler.referenceResolution = new Vector2(1080f, 1920f);
            scaler.matchWidthOrHeight = 1f;
            canvasObject.AddComponent<GraphicRaycaster>();

            RectTransform safeRoot = CreateStretchRect(canvasObject.transform, "SafeArea");
            safeRoot.gameObject.AddComponent<SafeAreaPanel>();

            CanvasGroup home = CreatePanel(safeRoot, "Home");
            CanvasGroup loadout = CreatePanel(safeRoot, "Loadout");
            CanvasGroup gameplay = CreatePanel(safeRoot, "GameplayRoot");

            CanvasGroup hud = CreatePanel(gameplay.transform, "HUD");
            CanvasGroup recovery = CreatePanel(gameplay.transform, "RecoveryPrompt");
            CanvasGroup rescue = CreatePanel(gameplay.transform, "RescueCard");
            CanvasGroup gameOver = CreatePanel(gameplay.transform, "GameOver");

            var sessionFlow = systems.GetComponent<GameSessionFlowController>();
            var runState = granny.GetComponent<GameRunStateController>();
            var balance = granny.GetComponent<BalanceController>();
            var runData = granny.GetComponent<RunDataController>();
            var recoveryWindow = granny.GetComponent<RecoveryWindowController>();
            var rescueWindow = granny.GetComponent<RescueWindowController>();
            var inputRouter = granny.GetComponent<GrannyInputRouter>();
            var lifecycle = granny.GetComponent<GameRunLifecycleController>();
            var motionSettings = systems.GetComponent<ReducedMotionSettings>();

            var frontEnd = canvasObject.AddComponent<FrontEndUIController>();
            Wire(frontEnd, "sessionFlow", sessionFlow);
            Wire(frontEnd, "home", home);
            Wire(frontEnd, "loadout", loadout);
            Wire(frontEnd, "gameplayRoot", gameplay);

            var gameUI = canvasObject.AddComponent<GameUIStateController>();
            Wire(gameUI, "runState", runState);
            Wire(gameUI, "sessionFlow", sessionFlow);
            Wire(gameUI, "hud", hud);
            Wire(gameUI, "recoveryPrompt", recovery);
            Wire(gameUI, "rescueCard", rescue);
            Wire(gameUI, "gameOverPanel", gameOver);

            BuildHome(home.transform, lifecycle, frontEnd);
            BuildLoadout(loadout.transform, lifecycle, frontEnd);
            BuildHUD(hud.transform, runData, balance, motionSettings);
            BuildRecovery(recovery, recoveryWindow, inputRouter);
            BuildRescue(rescue, rescueWindow);
            BuildGameOver(gameOver, lifecycle, runState, runData);

            canvasObject.SetActive(true);
        }

        private static void BuildEventSystem()
        {
            var go = new GameObject("EventSystem");
            go.AddComponent<EventSystem>();
            var module = go.AddComponent<InputSystemUIInputModule>();
            module.AssignDefaultActions();
        }

        private static void BuildHome(
            Transform parent,
            GameRunLifecycleController lifecycle,
            FrontEndUIController frontEnd
        )
        {
            CreateBackdrop(parent, new Color(0.09f, 0.07f, 0.14f, 0.72f));
            CreateText(parent, "Title", "DON’T FALL\nGRANNY", 76,
                new Vector2(0.08f, 0.70f), new Vector2(0.92f, 0.92f),
                TextAlignmentOptions.Center, new Color32(255, 248, 236, 255));

            CreateText(parent, "Subtitle", "Stay upright. Survive the chaos.", 30,
                new Vector2(0.08f, 0.61f), new Vector2(0.92f, 0.70f),
                TextAlignmentOptions.Center, new Color32(255, 204, 101, 255));

            Button play = CreateButton(parent, "PlayButton", "PLAY", 44,
                new Vector2(0.12f, 0.18f), new Vector2(0.88f, 0.28f),
                new Color32(255, 204, 101, 255));
            UnityEventTools.AddPersistentListener(play.onClick, lifecycle.StartFreshRun);

            Button loadout = CreateButton(parent, "LoadoutButton", "OUTFIT & GADGET", 30,
                new Vector2(0.20f, 0.09f), new Vector2(0.80f, 0.16f),
                new Color32(255, 248, 236, 245));
            UnityEventTools.AddPersistentListener(loadout.onClick, frontEnd.OnLoadoutPressed);
        }

        private static void BuildLoadout(
            Transform parent,
            GameRunLifecycleController lifecycle,
            FrontEndUIController frontEnd
        )
        {
            CreateBackdrop(parent, new Color(0.12f, 0.09f, 0.17f, 0.88f));
            CreateText(parent, "Title", "KIES GRANNY’S LOOK", 48,
                new Vector2(0.08f, 0.80f), new Vector2(0.92f, 0.90f),
                TextAlignmentOptions.Center, Color.white);
            CreateText(parent, "Preview", "Prototype loadout\nOutfits & gadgets komen hier", 30,
                new Vector2(0.12f, 0.38f), new Vector2(0.88f, 0.68f),
                TextAlignmentOptions.Center, new Color32(255, 248, 236, 255));

            Button play = CreateButton(parent, "PlayButton", "START RUN", 38,
                new Vector2(0.12f, 0.14f), new Vector2(0.88f, 0.23f),
                new Color32(255, 204, 101, 255));
            UnityEventTools.AddPersistentListener(play.onClick, lifecycle.StartFreshRun);

            Button back = CreateButton(parent, "BackButton", "TERUG", 28,
                new Vector2(0.27f, 0.06f), new Vector2(0.73f, 0.12f),
                new Color32(255, 248, 236, 240));
            UnityEventTools.AddPersistentListener(back.onClick, frontEnd.OnHomePressed);
        }

        private static void BuildHUD(
            Transform parent,
            RunDataController runData,
            BalanceController balance,
            ReducedMotionSettings motionSettings
        )
        {
            TMP_Text distance = CreateText(parent, "Distance", "0 m", 38,
                new Vector2(0.04f, 0.92f), new Vector2(0.30f, 0.98f),
                TextAlignmentOptions.Left, Color.white);
            TMP_Text coins = CreateText(parent, "Coins", "● 0", 34,
                new Vector2(0.72f, 0.92f), new Vector2(0.96f, 0.98f),
                TextAlignmentOptions.Right, new Color32(255, 204, 101, 255));
            TMP_Text balanceLabel = CreateText(parent, "Balance", "BALANCE: STABLE", 24,
                new Vector2(0.25f, 0.86f), new Vector2(0.75f, 0.91f),
                TextAlignmentOptions.Center, new Color32(255, 248, 236, 230));

            Image balanceBackground = CreateImage(
                parent,
                "BalanceBarBackground",
                new Vector2(0.25f, 0.835f),
                new Vector2(0.75f, 0.852f),
                new Color32(53, 43, 73, 185)
            );

            Image balanceFill = CreateImage(
                balanceBackground.transform,
                "Fill",
                Vector2.zero,
                Vector2.one,
                new Color32(255, 204, 101, 255)
            );
            balanceFill.type = Image.Type.Filled;
            balanceFill.fillMethod = Image.FillMethod.Horizontal;
            balanceFill.fillOrigin = (int)Image.OriginHorizontal.Left;

            TMP_Text nearMiss = CreateText(
                parent,
                "NearMiss",
                "NEAR MISS",
                31,
                new Vector2(0.28f, 0.73f),
                new Vector2(0.72f, 0.80f),
                TextAlignmentOptions.Center,
                new Color32(255, 204, 101, 255)
            );

            var controller = parent.gameObject.AddComponent<RunHUDController>();
            Wire(controller, "runData", runData);
            Wire(controller, "balance", balance);
            Wire(controller, "motionSettings", motionSettings);
            Wire(controller, "distanceLabel", distance);
            Wire(controller, "coinsLabel", coins);
            Wire(controller, "balanceLabel", balanceLabel);
            Wire(controller, "nearMissLabel", nearMiss);
            Wire(controller, "balanceFill", balanceFill);
            Wire(controller, "coinPulseTarget", coins.rectTransform);
        }

        private static void BuildRecovery(
            CanvasGroup panel,
            RecoveryWindowController recoveryWindow,
            GrannyInputRouter inputRouter
        )
        {
            TMP_Text countdown = CreateText(panel.transform, "RecoveryText", "HERSTEL! 1.0s", 42,
                new Vector2(0.18f, 0.21f), new Vector2(0.82f, 0.28f),
                TextAlignmentOptions.Center, Color.white);

            Image progress = CreateImage(panel.transform, "RecoveryProgress",
                new Vector2(0.18f, 0.19f), new Vector2(0.82f, 0.205f),
                new Color32(255, 204, 101, 255));
            progress.type = Image.Type.Filled;
            progress.fillMethod = Image.FillMethod.Horizontal;

            Button recover = CreateButton(panel.transform, "RecoverButton", "RED GRANNY!", 38,
                new Vector2(0.16f, 0.09f), new Vector2(0.84f, 0.17f),
                new Color32(249, 182, 188, 255));

            var controller = panel.gameObject.AddComponent<RecoveryPromptController>();
            Wire(controller, "recoveryWindow", recoveryWindow);
            Wire(controller, "inputRouter", inputRouter);
            Wire(controller, "countdownLabel", countdown);
            Wire(controller, "progressFill", progress);
            UnityEventTools.AddPersistentListener(recover.onClick, controller.OnRecoverPressed);
        }

        private static void BuildRescue(CanvasGroup panel, RescueWindowController rescueWindow)
        {
            GameObject card = CreateCard(panel.transform, "RescueCardVisual",
                new Vector2(0.08f, 0.25f), new Vector2(0.92f, 0.72f),
                new Color32(255, 248, 236, 255));

            TMP_Text title = CreateText(card.transform, "Title", "Granny is gevallen!", 46,
                new Vector2(0.08f, 0.68f), new Vector2(0.92f, 0.88f),
                TextAlignmentOptions.Center, new Color32(53, 43, 73, 255));

            TMP_Text countdown = CreateText(card.transform, "Countdown", "Nog 10.0 seconden", 28,
                new Vector2(0.12f, 0.53f), new Vector2(0.88f, 0.65f),
                TextAlignmentOptions.Center, new Color32(53, 43, 73, 255));

            var perimeter = card.AddComponent<RectPerimeterTimerController>();
            Image top = CreateEdge(card.transform, "TimerTop", true, true);
            Image right = CreateEdge(card.transform, "TimerRight", false, true);
            Image bottom = CreateEdge(card.transform, "TimerBottom", true, false);
            Image left = CreateEdge(card.transform, "TimerLeft", false, false);
            Wire(perimeter, "top", top);
            Wire(perimeter, "right", right);
            Wire(perimeter, "bottom", bottom);
            Wire(perimeter, "left", left);

            Button rescue = CreateButton(card.transform, "RescueButton", "HELP GRANNY OP", 34,
                new Vector2(0.10f, 0.25f), new Vector2(0.90f, 0.42f),
                new Color32(255, 204, 101, 255));

            Button stop = CreateButton(card.transform, "StopButton", "STOP DE RUN", 24,
                new Vector2(0.24f, 0.09f), new Vector2(0.76f, 0.19f),
                new Color32(245, 235, 224, 255));

            var controller = panel.gameObject.AddComponent<RescuePanelController>();
            Wire(controller, "rescueWindow", rescueWindow);
            Wire(controller, "panel", panel);
            Wire(controller, "titleLabel", title);
            Wire(controller, "countdownLabel", countdown);
            Wire(controller, "perimeterTimer", perimeter);

            UnityEventTools.AddPersistentListener(rescue.onClick, controller.OnRescuePressed);
            UnityEventTools.AddPersistentListener(stop.onClick, controller.OnGameOverPressed);
        }

        private static void BuildGameOver(
            CanvasGroup panel,
            GameRunLifecycleController lifecycle,
            GameRunStateController runState,
            RunDataController runData
        )
        {
            CreateBackdrop(panel.transform, new Color(0.08f, 0.06f, 0.12f, 0.82f));

            TMP_Text result = CreateText(panel.transform, "Result",
                "RUN VOORBIJ\n0 meter", 52,
                new Vector2(0.10f, 0.62f), new Vector2(0.90f, 0.80f),
                TextAlignmentOptions.Center, Color.white);

            TMP_Text reward = CreateText(panel.transform, "Reward",
                "+0 coins\nNieuwe beste score: —", 28,
                new Vector2(0.15f, 0.49f), new Vector2(0.85f, 0.61f),
                TextAlignmentOptions.Center, new Color32(255, 204, 101, 255));

            Button replay = CreateButton(panel.transform, "ReplayButton", "OPNIEUW", 40,
                new Vector2(0.13f, 0.25f), new Vector2(0.87f, 0.35f),
                new Color32(255, 204, 101, 255));

            Button home = CreateButton(panel.transform, "HomeButton", "NAAR HOME", 27,
                new Vector2(0.25f, 0.16f), new Vector2(0.75f, 0.22f),
                new Color32(255, 248, 236, 245));

            var controller = panel.gameObject.AddComponent<GameOverPanelController>();
            Wire(controller, "lifecycle", lifecycle);
            Wire(controller, "runState", runState);
            Wire(controller, "runData", runData);
            Wire(controller, "resultLabel", result);
            Wire(controller, "rewardLabel", reward);

            UnityEventTools.AddPersistentListener(replay.onClick, controller.OnReplayPressed);
            UnityEventTools.AddPersistentListener(home.onClick, controller.OnHomePressed);
        }

        private static RectTransform CreateStretchRect(Transform parent, string name)
        {
            var go = new GameObject(name, typeof(RectTransform));
            go.transform.SetParent(parent, false);
            var rect = (RectTransform)go.transform;
            rect.anchorMin = Vector2.zero;
            rect.anchorMax = Vector2.one;
            rect.offsetMin = Vector2.zero;
            rect.offsetMax = Vector2.zero;
            return rect;
        }

        private static CanvasGroup CreatePanel(Transform parent, string name)
        {
            RectTransform rect = CreateStretchRect(parent, name);
            var group = rect.gameObject.AddComponent<CanvasGroup>();
            group.alpha = 0f;
            group.interactable = false;
            group.blocksRaycasts = false;
            return group;
        }

        private static GameObject CreateCard(
            Transform parent,
            string name,
            Vector2 min,
            Vector2 max,
            Color color
        )
        {
            Image image = CreateImage(parent, name, min, max, color);
            return image.gameObject;
        }

        private static Image CreateBackdrop(Transform parent, Color color)
        {
            return CreateImage(parent, "Backdrop", Vector2.zero, Vector2.one, color);
        }

        private static Image CreateImage(
            Transform parent,
            string name,
            Vector2 min,
            Vector2 max,
            Color color
        )
        {
            var go = new GameObject(name, typeof(RectTransform), typeof(CanvasRenderer), typeof(Image));
            go.transform.SetParent(parent, false);
            var rect = (RectTransform)go.transform;
            rect.anchorMin = min;
            rect.anchorMax = max;
            rect.offsetMin = Vector2.zero;
            rect.offsetMax = Vector2.zero;
            var image = go.GetComponent<Image>();
            image.color = color;
            return image;
        }

        private static TMP_Text CreateText(
            Transform parent,
            string name,
            string value,
            float fontSize,
            Vector2 min,
            Vector2 max,
            TextAlignmentOptions alignment,
            Color color
        )
        {
            var go = new GameObject(
                name,
                typeof(RectTransform),
                typeof(CanvasRenderer),
                typeof(TextMeshProUGUI)
            );
            go.transform.SetParent(parent, false);
            var rect = (RectTransform)go.transform;
            rect.anchorMin = min;
            rect.anchorMax = max;
            rect.offsetMin = Vector2.zero;
            rect.offsetMax = Vector2.zero;

            var text = go.GetComponent<TextMeshProUGUI>();
            text.text = value;
            text.fontSize = fontSize;
            text.fontStyle = FontStyles.Bold;
            text.alignment = alignment;
            text.color = color;
            text.enableAutoSizing = true;
            text.fontSizeMin = 18f;
            text.fontSizeMax = fontSize;
            return text;
        }

        private static Button CreateButton(
            Transform parent,
            string name,
            string label,
            float fontSize,
            Vector2 min,
            Vector2 max,
            Color color
        )
        {
            Image image = CreateImage(parent, name, min, max, color);
            var button = image.gameObject.AddComponent<Button>();
            button.targetGraphic = image;

            TMP_Text text = CreateText(
                image.transform,
                "Label",
                label,
                fontSize,
                new Vector2(0.05f, 0.08f),
                new Vector2(0.95f, 0.92f),
                TextAlignmentOptions.Center,
                new Color32(53, 43, 73, 255)
            );
            text.raycastTarget = false;
            return button;
        }

        private static Image CreateEdge(
            Transform parent,
            string name,
            bool horizontal,
            bool leading
        )
        {
            Vector2 min;
            Vector2 max;

            if (horizontal)
            {
                min = new Vector2(0f, leading ? 0.985f : 0f);
                max = new Vector2(1f, leading ? 1f : 0.015f);
            }
            else
            {
                min = new Vector2(leading ? 0.985f : 0f, 0f);
                max = new Vector2(leading ? 1f : 0.015f, 1f);
            }

            Image edge = CreateImage(
                parent,
                name,
                min,
                max,
                new Color32(240, 120, 101, 255)
            );

            edge.type = Image.Type.Filled;
            edge.fillMethod = horizontal
                ? Image.FillMethod.Horizontal
                : Image.FillMethod.Vertical;
            edge.fillAmount = 1f;
            return edge;
        }

        private static void Wire(Object target, string property, Object value)
        {
            var so = new SerializedObject(target);
            SerializedProperty p = so.FindProperty(property);
            if (p != null)
            {
                p.objectReferenceValue = value;
                so.ApplyModifiedPropertiesWithoutUndo();
            }
        }

        private static GameObject CreatePrimitiveChild(
            Transform parent,
            PrimitiveType primitive,
            string name,
            Vector3 localPosition,
            Vector3 localScale,
            Material material
        )
        {
            GameObject child = GameObject.CreatePrimitive(primitive);
            child.name = name;
            child.transform.SetParent(parent);
            child.transform.localPosition = localPosition;
            child.transform.localRotation = Quaternion.identity;
            child.transform.localScale = localScale;
            child.GetComponent<Renderer>().sharedMaterial = material;

            Collider collider = child.GetComponent<Collider>();
            if (collider != null)
                Object.DestroyImmediate(collider);

            return child;
        }

        private sealed class MaterialSet
        {
            public Material Cream;
            public Material Plum;
            public Material Mustard;
            public Material DustyPink;
            public Material Mint;
            public Material Asphalt;
            public Material Grass;
            public Material White;
        }
    }
}
