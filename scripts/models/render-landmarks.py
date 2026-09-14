"""Render overview and labeled eight-landmark detail plate; no source edits."""
import bpy, pathlib, json, math
from mathutils import Vector
ROOT=pathlib.Path(__file__).resolve().parents[2]
bpy.ops.wm.open_mainfile(filepath=str(ROOT/'reference/island-source/rishiri-miniature.blend'))
scene=bpy.context.scene
# Show the same general-tree/platform visibility currently selected in the app.
for o in bpy.data.collections['Vegetation'].objects:o.hide_render=True
bpy.data.objects['Terrain_Cliff'].hide_render=True
scene.render.filepath=str(ROOT/'artifacts/island-miniature/landmarks-overview.png')
scene.render.resolution_x=1600;scene.render.resolution_y=1200
bpy.ops.render.render(write_still=True)
# Orthographic detail plate. Original mesh data is shared; no edit to the source.
for o in bpy.data.objects:
 if o.type not in ['LIGHT','CAMERA']:o.hide_render=True
layout=[('PeshiCape',-12,6,8),('RishiriAirport',0,6,13),('OshidomariFerryTerminal',12,6,8),('RishirifujiTownHall',-12,-6,8),('TownHallPark',0,-6,7),('HimePond',12,-6,9),('NumauraViewpoint',-6,-18,8),('OtatomariPond',6,-18,8)]
label_material=bpy.data.materials['Glass'].copy();label_material.name='PreviewLabel'
label_material.node_tree.nodes.get('Principled BSDF').inputs['Base Color'].default_value=(.025,.06,.065,1)
font=bpy.data.fonts.load('/System/Library/Fonts/Supplemental/Arial Unicode.ttf')
labels={i['id']:i['name'] for i in json.loads((ROOT/'reference/island-source/landmarks.json').read_text())}
for name,x,y,size in layout:
 src=bpy.data.objects[name]
 p=bpy.data.objects.new(name+'_detail',None);scene.collection.objects.link(p);p.location=(x,y,0);p.scale=(8/size,)*3
 for o in src.children:
  if o.type!='MESH':continue
  c=o.copy();c.data=o.data;scene.collection.objects.link(c);c.parent=p;c.hide_render=False
 bpy.context.view_layer.update()
 bottom=min((c.matrix_world@v.co).z for c in p.children if c.type=='MESH' for v in c.data.vertices)
 p.location.z-=bottom
 label=bpy.data.curves.new('Landmark_label','FONT');label.body=labels[name];label.font=font;label.align_x='CENTER';label.size=.58;label.resolution_u=3
 text=bpy.data.objects.new(name+'_label',label);scene.collection.objects.link(text);text.location=(x,y-(4.5 if name=='RishiriAirport' else 3.7),.025);label.materials.append(label_material)
bpy.ops.mesh.primitive_plane_add(size=90,location=(0,0,-.02))
floor=bpy.context.object;floor.name='Contact_sheet_floor';floor.data.materials.append(bpy.data.materials['Walls'])
cam=scene.camera;cam.location=(0,-46,63);cam.rotation_euler=(Vector((0,-4,0))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.ortho_scale=43
scene.render.resolution_x=1600;scene.render.resolution_y=1400;scene.render.film_transparent=False
scene.render.filepath=str(ROOT/'artifacts/island-miniature/landmarks-details.png');bpy.ops.render.render(write_still=True)
