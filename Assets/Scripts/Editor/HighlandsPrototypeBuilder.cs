#if UNITY_EDITOR
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.SceneManagement;

/// <summary>Menu: Project Highlands > Build Prototype Scene.</summary>
public static class HighlandsPrototypeBuilder
{
    private const string SceneFolder = "Assets/Scenes";
    private const string ScenePath = "Assets/Scenes/HighlandsPrototype.unity";

    [MenuItem("Project Highlands/Build Prototype Scene")]
    public static void BuildPrototypeScene()
    {
        if (!AssetDatabase.IsValidFolder(SceneFolder))
            AssetDatabase.CreateFolder("Assets", "Scenes");

        Scene scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);
        Material groundMat = MakeMaterial("Highlands Ground", new Color(0.20f, 0.29f, 0.19f));
        Material rockMat = MakeMaterial("Highlands Stone", new Color(0.31f, 0.34f, 0.32f));
        Material barkMat = MakeMaterial("Highlands Bark", new Color(0.20f, 0.12f, 0.075f));
        Material leafMat = MakeMaterial("Highlands Pine", new Color(0.10f, 0.24f, 0.15f));
        Material waterMat = MakeMaterial("Highlands River", new Color(0.12f, 0.36f, 0.46f));

        GameObject ground = GameObject.CreatePrimitive(PrimitiveType.Plane);
        ground.name = "Valley Floor";
        ground.transform.localScale = new Vector3(20f, 1f, 20f);
        ground.GetComponent<Renderer>().sharedMaterial = groundMat;

        for (int i = 0; i < 22; i++)
        {
            float a = i * Mathf.PI * 2f / 22f;
            float radius = Random.Range(105f, 155f);
            GameObject mountain = GameObject.CreatePrimitive(PrimitiveType.Cube);
            mountain.name = "Distant Mountain";
            mountain.transform.position = new Vector3(Mathf.Cos(a) * radius, Random.Range(22f, 42f), Mathf.Sin(a) * radius);
            mountain.transform.rotation = Quaternion.Euler(Random.Range(-8f, 8f), Random.Range(0f, 360f), Random.Range(-8f, 8f));
            mountain.transform.localScale = new Vector3(Random.Range(28f, 52f), Random.Range(55f, 100f), Random.Range(25f, 48f));
            mountain.GetComponent<Renderer>().sharedMaterial = rockMat;
        }

        GameObject river = GameObject.CreatePrimitive(PrimitiveType.Cube);
        river.name = "River";
        river.transform.position = new Vector3(0f, 0.12f, 22f);
        river.transform.localScale = new Vector3(8f, 0.12f, 180f);
        river.GetComponent<Renderer>().sharedMaterial = waterMat;

        for (int i = 0; i < 240; i++)
        {
            Vector2 p = Random.insideUnitCircle * 92f;
            if (Mathf.Abs(p.y - 22f) < 7f && Mathf.Abs(p.x) < 6f) continue;
            float h = Random.Range(4f, 8f);
            GameObject tree = new GameObject("Pine Tree");
            tree.transform.position = new Vector3(p.x, 0f, p.y);
            GameObject trunk = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
            trunk.name = "Trunk";
            trunk.transform.SetParent(tree.transform, false);
            trunk.transform.localPosition = new Vector3(0f, h * 0.32f, 0f);
            trunk.transform.localScale = new Vector3(0.22f, h * 0.32f, 0.22f);
            trunk.GetComponent<Renderer>().sharedMaterial = barkMat;

            for (int tier = 0; tier < 3; tier++)
            {
                GameObject crown = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
                crown.name = "Foliage Tier";
                crown.transform.SetParent(tree.transform, false);
                crown.transform.localPosition = new Vector3(0f, h * (0.42f + tier * 0.19f), 0f);
                crown.transform.localScale = new Vector3(1.25f - tier * 0.25f, h * 0.12f, 1.25f - tier * 0.25f);
                crown.GetComponent<Renderer>().sharedMaterial = leafMat;
            }
        }

        for (int i = 0; i < 90; i++)
        {
            GameObject rock = GameObject.CreatePrimitive(PrimitiveType.Sphere);
            rock.name = "Valley Rock";
            rock.transform.position = new Vector3(Random.Range(-90f, 90f), Random.Range(0.3f, 1.1f), Random.Range(-90f, 90f));
            rock.transform.localScale = new Vector3(Random.Range(1f, 4f), Random.Range(0.7f, 2.2f), Random.Range(1f, 3.5f));
            rock.transform.rotation = Random.rotation;
            rock.GetComponent<Renderer>().sharedMaterial = rockMat;
        }

        CreatePlayer();
        CreateLighting();
        CreateAtmosphere();

        EditorSceneManager.MarkSceneDirty(scene);
        EditorSceneManager.SaveScene(scene, ScenePath);
        AssetDatabase.SaveAssets();
        Selection.activeObject = AssetDatabase.LoadAssetAtPath<SceneAsset>(ScenePath);
        Debug.Log("Project Highlands scene created: " + ScenePath);
        EditorUtility.DisplayDialog("Project Highlands", "Scene created! Press Play to explore.\n\nWASD move, mouse look, Shift sprint, Space jump, Esc unlock cursor.", "Play");
    }

    private static Material MakeMaterial(string name, Color color)
    {
        Shader shader = Shader.Find("Universal Render Pipeline/Lit");
        if (shader == null) shader = Shader.Find("Standard");
        Material mat = new Material(shader);
        mat.name = name;
        mat.color = color;
        return mat;
    }

    private static void CreatePlayer()
    {
        GameObject player = new GameObject("Player");
        player.transform.position = new Vector3(0f, 2f, -12f);
        CharacterController cc = player.AddComponent<CharacterController>();
        cc.height = 1.8f;
        cc.radius = 0.34f;
        cc.center = new Vector3(0f, 0.9f, 0f);

        GameObject cam = new GameObject("Player Camera");
        cam.tag = "MainCamera";
        cam.transform.SetParent(player.transform, false);
        cam.transform.localPosition = new Vector3(0f, 1.58f, 0f);
        cam.AddComponent<Camera>().fieldOfView = 78f;
        cam.AddComponent<AudioListener>();

        HighlandsPlayerController controller = player.AddComponent<HighlandsPlayerController>();
        SerializedObject so = new SerializedObject(controller);
        so.FindProperty("playerCamera").objectReferenceValue = cam.transform;
        so.ApplyModifiedPropertiesWithoutUndo();
    }

    private static void CreateLighting()
    {
        GameObject lightObject = new GameObject("Highlands Sun");
        lightObject.transform.rotation = Quaternion.Euler(42f, 155f, 0f);
        Light sun = lightObject.AddComponent<Light>();
        sun.type = LightType.Directional;
        sun.intensity = 1.2f;
        sun.shadows = LightShadows.Soft;
        RenderSettings.ambientMode = UnityEngine.Rendering.AmbientMode.Trilight;
        RenderSettings.ambientSkyColor = new Color(0.34f, 0.43f, 0.52f);
        RenderSettings.ambientEquatorColor = new Color(0.25f, 0.29f, 0.24f);
        RenderSettings.ambientGroundColor = new Color(0.10f, 0.12f, 0.09f);
    }

    private static void CreateAtmosphere()
    {
        GameObject atmosphere = new GameObject("Highlands Atmosphere");
        HighlandsAtmosphere component = atmosphere.AddComponent<HighlandsAtmosphere>();
        SerializedObject so = new SerializedObject(component);
        GameObject sunObject = GameObject.Find("Highlands Sun");
        so.FindProperty("sun").objectReferenceValue = sunObject.GetComponent<Light>();
        so.ApplyModifiedPropertiesWithoutUndo();
    }
}
#endif
