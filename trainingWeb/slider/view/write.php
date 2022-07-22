<div class="box">
  <h4>보도자료</h4><br>
    <div class="box-table">
        <?php
        echo validation_errors('<div class="alert alert-warning" role="alert">', '</div>');
        $attributes = array('method'=>'post', 'class' => 'form-horizontal', 'name' => 'form_press_release', 'id' => 'form_press_release');
        echo form_open('admin/page/project/result?menu=press_release', $attributes);
        ?>
        <input type="hidden" name="<?php echo element('primary_key', $view); ?>"    value="<?php echo element(element('primary_key', $view), element('data', $view)); ?>" />
        <table class="style_table table-hover dataTab leForm">
          <colgroup>
            <col style="width:20%;" />
            <col style="width:80%;" />
          </colgroup>
          <tr>
            <th>제목</th>
            <td><input type="text" class="form-control" name="press_release_title" value="<?php echo set_value('press_release_title', element('press_release_title', element('data', $view))); ?>"/></td>
          </tr>
          <tr>
            <th>언론사 로고 등록</th>
            <td><input type="file" class="file zipFile" name="thumbnail" id="thumbnail" accept=".jpg, .gif, .png, .jpeg" /></td>
          </tr>
          <tr>
            <th>내용</th>
            <td>
            <?php echo display_dhtml_editor('press_release_content', set_value('press_release_content', element('press_release_content', element('data', $view))), $classname = 'form-control dhtmleditor', $is_dhtml_editor = $this->cbconfig->item('use_note_dhtml'), $editor_type = $this->cbconfig->item('note_editor_type')); ?>
            </td>
          </tr>
          <tr>
            <th>언론사 링크</th>
            <td><input type="text" class="form-control"  name="press_release_link" value="<?php echo set_value('press_release_link', element('press_release_link', element('data', $view))); ?>"/></td>
          </tr>
        </table>
        <br>
        <div class="btn-group pull-right" role="group" aria-label="...">
          <button type="button" class="btn btn-default btn-sm btn-history-back" onclick="history.back();">취소하기</button>
          <input id="save_button"type="submit" name="submit" class="btn btn-success btn-sm" value="저장하기"/>
        </div>
            
            <input type="hidden" id="upload_path" name="upload_path" />
            <input type="hidden" id="realname" name="realname" />
        <?php echo form_close(); ?>
    </div>
</div>
<div id="upload_loading" style="display:inline;position: fixed;margin: 0 auto;left: 0;right: 0;top:30%;display:none;">
  <div style="text-align:center;">
 <img src="<?php echo base_url('assets/imgs/main/upload_loading.gif')?>" />
</div>
</div>

<script type="text/javascript">
  var fileext = "";
//<![CDATA[
$(function() {
    $('#form_press_release').validate({
        rules: {
            press_release_title: 'required',
            press_release_content : {<?php echo ($this->cbconfig->item('use_note_dhtml')) ? 'required_' . $this->cbconfig->item('note_editor_type') : 'required'; ?> : true }
        }
    });
});

$("#thumbnail").change(function (){
      fileext = $("input[name=thumbnail]")[0].value;
      fileext = fileext.slice(fileext.indexOf(".") + 1); 
      if(fileext != "jpg" && fileext != "jpeg" && fileext != "png" &&  fileext != "pdf"){
        if(fileext == ""){
          alert("파일 선택을 취소 하셨습니다.");
        }
        else{
          alert('이미지 파일만 등록 가능합니다.');
        }
        return false;
      }

      uploadFile($("input[name=thumbnail]")[0].files);
      }); 

function uploadFile(files) {
      var formData = new FormData();
      var counts = files.length;
      for (var i = 0; i < counts; i++) {
        formData.append("up_pdf" + (i + 1), files[i]);
        console.log(files[i]);
      }
      var uploadURL = "uploads/project/press_release/";
      formData.append("upload_path", uploadURL);
      formData.append("file_ext", fileext);
      console.log(uploadURL);
      document.getElementById('upload_loading').style.display = 'inline';
      document.getElementById('save_button').disabled = true;
      $.ajax({
        url: '<?php echo base_url('admin/page/project/upload')?>',
        data: formData,
        processData: false,
        contentType: false,
        type: 'POST',
        dataType: 'json',
        success: function (data) {
          document.getElementById('upload_path').value = uploadURL+data;
        },
        complete : function () {
          document.getElementById('upload_loading').style.display = 'none';
          document.getElementById('save_button').disabled = false;
        }
      });
    }
//]]>
</script>