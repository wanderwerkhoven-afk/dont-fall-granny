using System;
using System.IO;
using UnityEditor;
using UnityEditor.Build.Reporting;
using UnityEngine;

namespace DontFallGranny.EditorTools
{
    public static class WebGLBuildPipeline
    {
        private const string ScenePath = "Assets/Scenes/VerticalSlice.unity";
        private const string OutputPath = "build/WebGL";

        public static void BuildForGitHubPages()
        {
            Debug.Log("Preparing Don’t Fall Granny vertical slice for WebGL...");

            VerticalSliceBootstrapBuilder.Build();

            if (!File.Exists(ScenePath))
                throw new InvalidOperationException(
                    $"Vertical slice scene was not generated at {ScenePath}."
                );

            if (Directory.Exists(OutputPath))
                Directory.Delete(OutputPath, true);

            Directory.CreateDirectory(OutputPath);

            PlayerSettings.WebGL.compressionFormat = WebGLCompressionFormat.Disabled;
            PlayerSettings.WebGL.decompressionFallback = true;

            BuildPlayerOptions options = new BuildPlayerOptions
            {
                scenes = new[] { ScenePath },
                locationPathName = OutputPath,
                target = BuildTarget.WebGL,
                options = BuildOptions.None
            };

            BuildReport report = BuildPipeline.BuildPlayer(options);

            if (report.summary.result != BuildResult.Succeeded)
            {
                throw new InvalidOperationException(
                    $"WebGL build failed: {report.summary.result} " +
                    $"({report.summary.totalErrors} errors)."
                );
            }

            File.WriteAllText(
                Path.Combine(OutputPath, ".nojekyll"),
                string.Empty
            );

            Debug.Log(
                $"WebGL build completed: {OutputPath} " +
                $"({report.summary.totalSize / (1024f * 1024f):0.0} MB)"
            );
        }
    }
}
