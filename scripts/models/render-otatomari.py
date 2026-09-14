"""Render the new pond beside Numaura Viewpoint, using current app visibility."""
import bpy, pathlib
from mathutils import Vector
ROOT=pathlib.Path(__file__).resolve().parents[2]
bpy.ops.wm.open_mainfile(filepath=str(ROOT/'reference/island-source/rishiri-miniature.blend'))
for o in bpy.data.collections['Vegetation'].objects:o.hide_render=True
bpy.data.objects['Terrain_Cliff'].hide_render=True
scene=bpy.context.scene
center=bpy.data.objects['OtatomariPond'].matrix_world.translation
cam=scene.camera;cam.location=center+Vector((-10,-14,15));cam.rotation_euler=(center-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.ortho_scale=13
scene.render.resolution_x=1200;scene.render.resolution_y=1000
scene.render.filepath=str(ROOT/'artifacts/island-miniature/otatomari-preview.png')
bpy.ops.render.render(write_still=True)
