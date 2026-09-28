<?php
/** 移行時の欠損・競合・部分失敗で画像設定を壊さないことを検証する。 */
define('ABSPATH', '/tmp/');
function add_action(...$args) {}
require __DIR__ . '/rishiri-image-repair.php';
$store = [];$options = [];$updates = [];$fail = false;
function get_option($key, $default = false) {global $options;return $options[$key] ?? $default;}
function add_option($key, $value, ...$rest) {global $options;$options[$key]=$value;return true;}
function update_option($key, $value, ...$rest) {global $options;$options[$key]=$value;return true;}
function get_post_meta($id,$key,$single=false) {global $store;$values=$store[$id][$key] ?? [];return $single ? ($values[0] ?? '') : $values;}
function delete_post_meta($id,$key) {global $store;unset($store[$id][$key]);}
function add_post_meta($id,$key,$value) {global $store;$store[$id][$key][]=$value;}
function clean_post_cache($id) {}
function wp_update_post($post) {global $updates;$updates[]=$post['ID'];}
function update_field($key,$value,$id) {
 global $store,$fail;
 $name=['field_ev_thumbnail_image'=>'thumbnail_image','field_ev_gallery_images'=>'gallery_images'][$key];
 if($fail && $name==='gallery_images')return false;
 $store[$id][$name]=[$value];$store[$id]['_'.$name]=[$key];return true;
}
function setup_case() {
 global $store,$options,$updates,$fail;
 $store=[12=>['thumbnail_image'=>[39],'_thumbnail_image'=>['field_ev_thumbnail_image'],'gallery_images'=>[[40,41]],'_gallery_images'=>['field_ev_gallery_images'],'period_month'=>[''],'title'=>['keep']]];
 $options=[];$updates=[];$fail=false;
 return [['id'=>12,'slug'=>'event','complete'=>true,'changed'=>true,'fields'=>[
  'thumbnail_image'=>['key'=>'field_ev_thumbnail_image','type'=>'image','next'=>[300]],
  'gallery_images'=>['key'=>'field_ev_gallery_images','type'=>'gallery','next'=>[301,302,303]],
 ]]];
}
function check($ok,$message) {if(!$ok)throw new RuntimeException('FAIL: '.$message);echo 'PASS: ',$message,"\n";}
function invoke_apply($rows) {$obj=new RishiriImageRepair();$method=new ReflectionMethod($obj,'apply');$method->setAccessible(true);return $method->invoke($obj,$rows);}
$rows=setup_case();$original=$store;$rows[0]['complete']=false;
try{invoke_apply($rows);throw new RuntimeException('expected failure');}catch(RuntimeException $e){check(str_contains($e->getMessage(),'不足画像'),'欠損時は停止');}
check($store===$original && !$updates,'欠損ギャラリーを保存しない');
$rows=setup_case();invoke_apply($rows);
check(get_post_meta(12,'gallery_images',true)===[301,302,303],'ギャラリーの全枚数と順序を保存');
check(get_post_meta(12,'period_month',true)==='' && get_post_meta(12,'title',true)==='keep','画像以外を保持');
check(count($updates)===1,'画像保存後に再検証フックへ通知');
$rows=setup_case();$original=$store;$fail=true;
try{invoke_apply($rows);throw new RuntimeException('expected failure');}catch(RuntimeException $e){check(str_contains($e->getMessage(),'保存確認'),'部分失敗を検知');}
check($store==$original && !$updates,'途中失敗した投稿の画像設定を復元');
$rows=setup_case();invoke_apply($rows);$store[12]['thumbnail_image']=[999];$snapshot=$store;
try{invoke_apply($rows);throw new RuntimeException('expected failure');}catch(RuntimeException $e){check(str_contains($e->getMessage(),'別途変更'),'同時編集を検知');}
check($store===$snapshot,'別編集者の変更を上書きしない');
$rows=setup_case();$rows[0]['changed']=false;$original=$store;invoke_apply($rows);
check($store===$original && !$updates,'一致済み投稿を再保存しない');
