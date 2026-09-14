"""Run with Blender in background; validate actual source mesh coordinates."""
import bpy, json, math, pathlib, ast
ROOT=pathlib.Path(__file__).resolve().parents[2]
SOURCE=ROOT/'reference/island-source'
bpy.ops.wm.open_mainfile(filepath=str(SOURCE/'rishiri-miniature.blend'))
# Reuse authoring projection and polygon routines without running generation.
namespace={'math':math}
code=ast.parse((ROOT/'scripts/models/build-miniature.py').read_text())
for n in code.body:
    if isinstance(n,ast.Assign) and any(isinstance(t,ast.Tuple) and any(isinstance(x,ast.Name) and x.id=='LAT0' for x in t.elts) for t in n.targets):exec(compile(ast.Module(body=[n],type_ignores=[]),'projection','exec'),namespace)
namespace['SX']=111.32*5;namespace['SY']=111.32*math.cos(math.radians(namespace['LAT0']))*5
for n in code.body:
    if isinstance(n,ast.FunctionDef) and n.name in ['xy','geom','inside','join_lines']:exec(compile(ast.Module(body=[n],type_ignores=[]),'geometry','exec'),namespace)
data=json.loads((SOURCE/'osm.json').read_text())['elements']
r=next(e for e in data if e['type']=='relation' and e['id']==4088083)
rings=namespace['join_lines']([namespace['geom'](m['geometry']) for m in r['members'] if m.get('role')=='outer' and m.get('geometry')])
inside=namespace['inside']
report={}
for name in ['Buildings','Roads','Landmarks']:
    count=0;bad=0
    for obj in bpy.data.collections[name].objects:
        if obj.type!='MESH':continue
        for poly in obj.data.polygons:
            center=obj.matrix_world@poly.center
            count+=1
            if not any(inside((center.x,center.y),ring[:-1]) for ring in rings):bad+=1
    report[name]={'faces':count,'outside_town_face_centers':bad}
report['groups']=[c for c in ['Terrain','Buildings','Roads','Vegetation','Water','Landmarks'] if bpy.data.collections.get(c)]
report['landmark_names']=[o.name for o in bpy.data.objects['Landmarks'].children]
assert set(report['landmark_names'])=={p['id'] for p in json.loads((SOURCE/'landmarks.json').read_text())}
report['textures']=len(bpy.data.images)-len([i for i in bpy.data.images if i.name in ['Render Result','Viewer Node']])
(SOURCE/'validation.json').write_text(json.dumps(report,indent=2))
print('GEOGRAPHY_VALIDATION',json.dumps(report))
assert all(report[n]['outside_town_face_centers']==0 for n in ['Buildings','Roads','Landmarks'])
