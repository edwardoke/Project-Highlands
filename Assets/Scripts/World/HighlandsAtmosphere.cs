using UnityEngine;

/// <summary>Fog, ambient color, and a lightweight day/night cycle.</summary>
public class HighlandsAtmosphere : MonoBehaviour
{
    [SerializeField] private Light sun;
    [SerializeField] private bool animateDayNight = true;
    [SerializeField, Min(0.1f)] private float fullDayLengthMinutes = 12f;
    [SerializeField, Range(0f, 1f)] private float timeOfDay = 0.32f;
    [SerializeField] private Gradient ambientColor;
    [SerializeField] private Gradient fogColor;

    private void Awake()
    {
        if (ambientColor == null || ambientColor.colorKeys.Length < 2)
            ambientColor = MakeGradient(
                new Color(0.025f, 0.04f, 0.09f),
                new Color(0.95f, 0.43f, 0.24f),
                new Color(0.45f, 0.62f, 0.72f));
        if (fogColor == null || fogColor.colorKeys.Length < 2)
            fogColor = MakeGradient(
                new Color(0.025f, 0.04f, 0.09f),
                new Color(0.76f, 0.53f, 0.43f),
                new Color(0.48f, 0.64f, 0.72f));

        RenderSettings.fog = true;
        RenderSettings.fogMode = FogMode.Exponential;
        RenderSettings.fogDensity = 0.006f;
        RenderSettings.ambientMode = UnityEngine.Rendering.AmbientMode.Flat;
    }

    private void Update()
    {
        if (animateDayNight)
            timeOfDay = Mathf.Repeat(timeOfDay + Time.deltaTime / (fullDayLengthMinutes * 60f), 1f);

        float angle = timeOfDay * 360f - 90f;
        if (sun != null)
        {
            sun.transform.rotation = Quaternion.Euler(angle, 155f, 0f);
            sun.intensity = Mathf.Clamp01(Mathf.Sin(timeOfDay * Mathf.PI * 2f) * 1.2f + 0.15f);
        }
        RenderSettings.ambientLight = ambientColor.Evaluate(timeOfDay);
        RenderSettings.fogColor = fogColor.Evaluate(timeOfDay);
    }

    private static Gradient MakeGradient(Color night, Color sunrise, Color day)
    {
        Gradient g = new Gradient();
        g.SetKeys(
            new[]
            {
                new GradientColorKey(night, 0f),
                new GradientColorKey(sunrise, 0.24f),
                new GradientColorKey(day, 0.5f),
                new GradientColorKey(sunrise, 0.76f),
                new GradientColorKey(night, 1f)
            },
            new[] { new GradientAlphaKey(1f, 0f), new GradientAlphaKey(1f, 1f) });
        return g;
    }
}
