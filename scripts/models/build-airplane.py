"""Build the pastel aircraft and sample its runway from the current island source."""
import bpy, json, math, pathlib
from mathutils import Vector
from mathutils.bvhtree import BVHTree
ROOT=pathlib.Path(__file__).resolve().parents[2]
SOURCE=ROOT/'reference/island-source'
bpy.ops.wm.open_mainfile(filepath=str(SOURCE/'rishiri-miniature.blend'))
terrain=next(o for o in bpy.data.objects if o.name.startswith('Terrain_Meadow'))
bvh=BVHTree.FromPolygons([terrain.matrix_world@v.co for v in terrain.data.vertices],[list(p.vertices) for p in terrain.data.polygons])
osm=json.loads((SOURCE/'osm.json').read_text())
if isinstance(osm,dict):osm=osm['elements']
way=next(e for e in osm if e['id']==442898211 and e['type']=='way')
def xy(p):return ((p['lat']-45.18)*111.32*5,-(p['lon']-141.225)*111.32*math.cos(math.radians(45.18))*5)
a,b=map(xy,[way['geometry'][0],way['geometry'][-1]])
# Sample the same 36 draped sections as the runway generator, in glTF axes.
samples=[]
for i in range(36):
 t=(i+.5)/36;x=a[0]+(b[0]-a[0])*t;y=a[1]+(b[1]-a[1])*t
 hit=bvh.ray_cast(Vector((x,y,100)),Vector((0,0,-1)))[0]
 assert hit is not None
 samples.append([round(x,6),round(hit.z+.115,6),round(-y,6)])
(ROOT/'lib/three/airport-runway.json').write_text(json.dumps({'source':'OSM runway 442898211 + current Blender terrain; X north, Y up, Z east','samples':samples},indent=2)+'\n')
bpy.ops.wm.read_factory_settings(use_empty=True)
scene=bpy.context.scene
materials={}
for name,color in [('Cream','FFF3DD'),('Mint','8DCBC1'),('Coral','E8A38D'),('Glass','477B87'),('Rubber','52686E'),('Butter','F4D78E')]:
 m=bpy.data.materials.new(name);m.diffuse_color=tuple(int(color[i:i+2],16)/255 for i in (0,2,4))+(1,);m.use_nodes=True
 bs=m.node_tree.nodes.get('Principled BSDF');bs.inputs['Base Color'].default_value=m.diffuse_color;bs.inputs['Roughness'].default_value=.72
 materials[name]=m
root=bpy.data.objects.new('Airplane',None);scene.collection.objects.link(root)
def coord(p):return (p[0],-p[2],p[1])
def group(name,pos=(0,0,0)):
 o=bpy.data.objects.new(name,None);scene.collection.objects.link(o);o.parent=root;o.location=coord(pos);return o
body=group('AirplaneBody');gear=group('LandingGear')
current=body
def finish(o,name,mat):
 o.name=name;o.parent=current;o.data.materials.append(materials[mat]);return o
def ellipsoid(name,pos,size,mat):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=12,ring_count=8,radius=1,location=coord(pos))
 o=finish(bpy.context.object,name,mat);o.scale=(size[0],size[2],size[1])
 for p in o.data.polygons:p.use_smooth=True
 return o
def block(name,pos,size,mat,bevel=.06):
 bpy.ops.mesh.primitive_cube_add(size=1,location=coord(pos));o=finish(bpy.context.object,name,mat);o.scale=(size[0],size[2],size[1]);bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 mod=o.modifiers.new('Soft toy edges','BEVEL');mod.width=bevel;mod.segments=2;bpy.ops.object.modifier_apply(modifier=mod.name)
 return o
ellipsoid('Rounded_fuselage',(0,0,0),(.35,.37,1.6),'Cream')
ellipsoid('Cockpit_glass',(0,.22,.95),(.29,.22,.46),'Glass')
block('High_wing',(0,.18,.1),(4.1,.13,.67),'Mint')
for side in [-1,1]:
 block('Coral_wingtip',(side*1.95,.22,.08),(.24,.17,.7),'Coral')
 ellipsoid('Engine',(side*1.02,.03,.5),(.19,.23,.53),'Cream')
 for z in [-.66,-.27,.12,.51]:ellipsoid('Cabin_window',(side*.334,.10,z),(.035,.09,.09),'Glass')
block('Tailplane',(0,.2,-1.19),(1.5,.10,.44),'Mint')
fin=block('Tail_fin',(0,.52,-1.19),(.13,.86,.57),'Coral');fin.rotation_euler.x=math.radians(-14)
block('Fin_tip',(0,.94,-1.09),(.16,.12,.48),'Butter')
current=gear
for x,z in [(-.28,-.25),(.28,-.25),(0,1.03)]:
 block('Strut',(x,-.4,z),(.055,.3,.055),'Cream',.02)
 ellipsoid('Wheel',(x,-.55,z),(.09,.12,.12),'Rubber')
for side,name in [(-1,'PropellerLeft'),(1,'PropellerRight')]:
 current=group(name,(side*1.02,.03,1.04))
 block('Propeller_blade',(0,0,0),(.10,.9,.055),'Butter',.035)
 ellipsoid('Propeller_hub',(0,0,.035),(.13,.13,.12),'Coral')
# One draw call per material per animated group; moving propellers keep local origins.
for parent in list(root.children):
 for mat in materials.values():
  objs=[o for o in list(parent.children) if o.data.materials[0]==mat]
  if not objs:continue
  bpy.ops.object.select_all(action='DESELECT')
  for o in objs:o.select_set(True)
  bpy.context.view_layer.objects.active=objs[0];bpy.ops.object.join();objs[0].name=parent.name+'_'+mat.name
bpy.ops.object.select_all(action='SELECT')
output=ROOT/'public/models/rishiri-airplane.glb'
bpy.ops.export_scene.gltf(filepath=str(output),export_format='GLB',use_selection=True,export_yup=True)
triangles=sum(sum(len(p.vertices)-2 for p in o.data.polygons) for o in bpy.data.objects if o.type=='MESH')
print('Aircraft:',triangles,'triangles,',output.stat().st_size,'bytes',flush=True)
scene.world=bpy.data.worlds.new('PastelStudio');scene.world.use_nodes=True;scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.78,.86,.84,1);scene.world.node_tree.nodes['Background'].inputs[1].default_value=.8
bpy.ops.object.light_add(type='AREA',location=(3,-4,7));bpy.context.object.data.energy=450;bpy.context.object.data.shape='DISK';bpy.context.object.data.size=6
bpy.ops.object.camera_add(location=(5,-7,4));cam=bpy.context.object;cam.rotation_euler=(Vector((0,0,.1))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=6.5;scene.camera=cam
scene.render.engine='CYCLES';scene.cycles.samples=32;scene.cycles.use_denoising=True;scene.view_settings.view_transform='Standard';scene.render.resolution_x=1200;scene.render.resolution_y=900;scene.render.resolution_percentage=100
bpy.ops.wm.save_as_mainfile(filepath=str(SOURCE/'rishiri-airplane.blend'))
scene.render.filepath=str(ROOT/'artifacts/island-miniature/airplane-preview.png');bpy.ops.render.render(write_still=True)
