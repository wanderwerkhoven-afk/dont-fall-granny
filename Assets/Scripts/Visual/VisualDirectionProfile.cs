using UnityEngine;

namespace DontFallGranny.Visual
{
    [CreateAssetMenu(
        fileName = "VisualDirectionProfile",
        menuName = "Don’t Fall Granny/Visual Direction Profile"
    )]
    public sealed class VisualDirectionProfile : ScriptableObject
    {
        [Header("Brand palette")]
        public Color cream = new Color32(255, 248, 236, 255);
        public Color plum = new Color32(53, 43, 73, 255);
        public Color mustard = new Color32(255, 204, 101, 255);
        public Color dustyPink = new Color32(249, 182, 188, 255);
        public Color mint = new Color32(78, 183, 155, 255);

        [Header("Shape language")]
        [Range(0f, 1f)] public float roundness = 0.8f;
        [Range(0f, 1f)] public float exaggeration = 0.65f;
        [Range(0f, 1f)] public float surfaceGloss = 0.35f;

        [Header("Presentation")]
        [Range(0f, 1f)] public float environmentDetailDensity = 0.45f;
        [Range(0f, 1f)] public float vfxIntensity = 0.55f;
        [Range(0f, 1f)] public float uiDepth = 0.4f;
    }
}
