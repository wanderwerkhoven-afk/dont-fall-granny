using System.IO;
using DontFallGranny.Core;
using DontFallGranny.Feedback;
using DontFallGranny.Input;
using DontFallGranny.UI;
using DontFallGranny.Visual;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
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

            Scene scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);

            GameObject systems = BuildSystems();
            GameObject granny = BuildGrannyPrototype(materials);
            GameObject environment = BuildStreet(materials);
            BuildLighting();
            BuildCamera(granny.transform);
            BuildUI(systems);

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
            systems.AddComponent<GameRunStateController>();
            systems.AddComponent<GameTimeController>();

            return systems;
        }

        private static GameObject BuildGrannyPrototype(MaterialSet materials)
        {
            var root = new GameObject("GrannyPrototype");
            root.transform.position = new Vector3(0f, 1f, 0f);

            var body = root.AddComponent<Rigidbody>();
            body.mass = 1.2f;
            body.constraints = RigidbodyConstraints.FreezeRotationX |
                               RigidbodyConstraints.FreezeRotationZ;

            root.AddComponent<CapsuleCollider>();
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

            CreatePrimitiveChild(
                root.transform,
                PrimitiveType.Sphere,
                "Head",
                new Vector3(0f, 0.95f, 0f),
                new Vector3(0.68f, 0.68f, 0.68f),
                materials.Cream
            );

            CreatePrimitiveChild(
                root.transform,
                PrimitiveType.Capsule,
                "Coat",
                new Vector3(0f, 0.15f, 0f),
                new Vector3(0.82f, 0.82f, 0.82f),
                materials.DustyPink
            );

            CreatePrimitiveChild(
                root.transform,
                PrimitiveType.Sphere,
                "Hair",
                new Vector3(0f, 1.22f, -0.04f),
                new Vector3(0.76f, 0.34f, 0.76f),
                materials.White
            );

            var glasses = new GameObject("Glasses");
            glasses.transform.SetParent(root.transform);
            glasses.transform.localPosition = new Vector3(0f, 1.02f, 0.31f);

            CreatePrimitiveChild(
                glasses.transform,
                PrimitiveType.Torus,
                "Lens_L",
                new Vector3(-0.19f, 0f, 0f),
                new Vector3(0.18f, 0.18f, 0.18f),
                materials.Plum
            );

            CreatePrimitiveChild(
                glasses.transform,
                PrimitiveType.Torus,
                "Lens_R",
                new Vector3(0.19f, 0f, 0f),
                new Vector3(0.18f, 0.18f, 0.18f),
                materials.Plum
            );

            return root;
        }

        private static GameObject BuildStreet(MaterialSet materials)
        {
            var environment = new GameObject("SuburbanStreet");

            GameObject road = GameObject.CreatePrimitive(PrimitiveType.Cube);
            road.name = "Road";
            road.transform.SetParent(environment.transform);
            road.transform.position = new Vector3(0f, -0.25f, 45f);
            road.transform.localScale = new Vector3(8f, 0.5f, 100f);
            road.GetComponent<Renderer>().sharedMaterial = materials.Asphalt;

            for (int side = -1; side <= 1; side += 2)
            {
                GameObject grass = GameObject.CreatePrimitive(PrimitiveType.Cube);
                grass.name = side < 0 ? "Grass_Left" : "Grass_Right";
                grass.transform.SetParent(environment.transform);
                grass.transform.position = new Vector3(side * 8f, -0.3f, 45f);
                grass.transform.localScale = new Vector3(8f, 0.4f, 100f);
                grass.GetComponent<Renderer>().sharedMaterial = materials.Grass;

                for (int i = 0; i < 6; i++)
                {
                    float z = 12f + i * 16f;
                    BuildHouse(environment.transform, new Vector3(side * 10f, 1.4f, z), materials, i);
                }
            }

            BuildObstacle(environment.transform, new Vector3(0f, 0.5f, 18f), materials.Mustard);
            BuildObstacle(environment.transform, new Vector3(1.4f, 0.5f, 31f), materials.Mint);
            BuildObstacle(environment.transform, new Vector3(-1.3f, 0.5f, 45f), materials.DustyPink);

            return environment;
        }

        private static void BuildHouse(
            Transform parent,
            Vector3 position,
            MaterialSet materials,
            int index
        )
        {
            GameObject house = GameObject.CreatePrimitive(PrimitiveType.Cube);
            house.name = $"House_{index}";
            house.transform.SetParent(parent);
            house.transform.position = position;
            house.transform.localScale = new Vector3(5f, 2.8f, 5f);
            house.GetComponent<Renderer>().sharedMaterial =
                index % 2 == 0 ? materials.Cream : materials.DustyPink;

            GameObject roof = GameObject.CreatePrimitive(PrimitiveType.Cube);
            roof.name = "Roof";
            roof.transform.SetParent(house.transform);
            roof.transform.localPosition = new Vector3(0f, 0.65f, 0f);
            roof.transform.localRotation = Quaternion.Euler(0f, 0f, 45f);
            roof.transform.localScale = new Vector3(0.75f, 0.75f, 1.05f);
            roof.GetComponent<Renderer>().sharedMaterial = materials.Plum;
        }

        private static void BuildObstacle(Transform parent, Vector3 position, Material material)
        {
            GameObject obstacle = GameObject.CreatePrimitive(PrimitiveType.Cube);
            obstacle.name = "PrototypeObstacle";
            obstacle.transform.SetParent(parent);
            obstacle.transform.position = position;
            obstacle.transform.localScale = new Vector3(1f, 1f, 0.8f);
            obstacle.GetComponent<Renderer>().sharedMaterial = material;
            obstacle.AddComponent<ObstacleImpactSource>();
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

        private static void BuildCamera(Transform granny)
        {
            GameObject cameraObject = new GameObject("Main Camera");
            cameraObject.tag = "MainCamera";

            var camera = cameraObject.AddComponent<Camera>();
            camera.clearFlags = CameraClearFlags.Skybox;
            camera.fieldOfView = 58f;

            var feel = cameraObject.AddComponent<RunnerCameraFeelController>();

            SerializedObject serialized = new SerializedObject(feel);
            serialized.FindProperty("targetCamera").objectReferenceValue = camera;
            serialized.FindProperty("followTarget").objectReferenceValue = granny;
            serialized.ApplyModifiedPropertiesWithoutUndo();

            cameraObject.transform.position = granny.position + new Vector3(4.6f, 2.8f, -7.5f);
        }

        private static void BuildUI(GameObject systems)
        {
            GameObject canvasObject = new GameObject("GameCanvas");
            var canvas = canvasObject.AddComponent<Canvas>();
            canvas.renderMode = RenderMode.ScreenSpaceOverlay;
            canvasObject.AddComponent<CanvasScaler>();
            canvasObject.AddComponent<GraphicRaycaster>();

            var scaler = canvasObject.GetComponent<CanvasScaler>();
            scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
            scaler.referenceResolution = new Vector2(1080f, 1920f);
            scaler.matchWidthOrHeight = 1f;

            CanvasGroup home = CreatePanel(canvasObject.transform, "Home");
            CanvasGroup loadout = CreatePanel(canvasObject.transform, "Loadout");
            CanvasGroup gameplay = CreatePanel(canvasObject.transform, "GameplayRoot");

            CanvasGroup hud = CreatePanel(gameplay.transform, "HUD");
            CanvasGroup recovery = CreatePanel(gameplay.transform, "RecoveryPrompt");
            CanvasGroup rescue = CreatePanel(gameplay.transform, "RescueCard");
            CanvasGroup gameOver = CreatePanel(gameplay.transform, "GameOver");

            var frontEnd = canvasObject.AddComponent<FrontEndUIController>();
            var gameUI = canvasObject.AddComponent<GameUIStateController>();

            var sessionFlow = systems.GetComponent<GameSessionFlowController>();
            var runState = systems.GetComponent<GameRunStateController>();

            SerializedObject frontEndSO = new SerializedObject(frontEnd);
            frontEndSO.FindProperty("sessionFlow").objectReferenceValue = sessionFlow;
            frontEndSO.FindProperty("home").objectReferenceValue = home;
            frontEndSO.FindProperty("loadout").objectReferenceValue = loadout;
            frontEndSO.FindProperty("gameplayRoot").objectReferenceValue = gameplay;
            frontEndSO.ApplyModifiedPropertiesWithoutUndo();

            SerializedObject gameUISO = new SerializedObject(gameUI);
            gameUISO.FindProperty("runState").objectReferenceValue = runState;
            gameUISO.FindProperty("sessionFlow").objectReferenceValue = sessionFlow;
            gameUISO.FindProperty("hud").objectReferenceValue = hud;
            gameUISO.FindProperty("recoveryPrompt").objectReferenceValue = recovery;
            gameUISO.FindProperty("rescueCard").objectReferenceValue = rescue;
            gameUISO.FindProperty("gameOverPanel").objectReferenceValue = gameOver;
            gameUISO.ApplyModifiedPropertiesWithoutUndo();
        }

        private static CanvasGroup CreatePanel(Transform parent, string name)
        {
            var panel = new GameObject(name);
            panel.transform.SetParent(parent, false);

            var rect = panel.AddComponent<RectTransform>();
            rect.anchorMin = Vector2.zero;
            rect.anchorMax = Vector2.one;
            rect.offsetMin = Vector2.zero;
            rect.offsetMax = Vector2.zero;

            panel.AddComponent<CanvasGroup>();
            return panel.GetComponent<CanvasGroup>();
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

        private readonly struct MaterialSet
        {
            public Material Cream { get; init; }
            public Material Plum { get; init; }
            public Material Mustard { get; init; }
            public Material DustyPink { get; init; }
            public Material Mint { get; init; }
            public Material Asphalt { get; init; }
            public Material Grass { get; init; }
            public Material White { get; init; }
        }
    }
}
