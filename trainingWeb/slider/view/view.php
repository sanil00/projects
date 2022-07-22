<link rel="stylesheet" type="text/css" href="<?php echo base_url('views/admin/basic/page/project/css/admin_project.css'); ?>" />
<div class="box">
<h4>보도자료</h4><br>
<div class="box-table">
<table class="style_table table-hover dataTab leForm" >
    <colgroup>
        <col style="width:20%">
        <col style="width:80%">
    </colgroup>
    <tr>
        <th>제목</th>
        <td><?php echo $view['board']['press_release_title']; ?></td>
    </tr>
    <tr>
        <th>언론사</th>
        <td><?php echo '<img src="'.base_url($view['board']['press_release_upload_path']).'" />';?></td>
    </tr>
    <tr>
        <th>내용</th>
        <td><?php echo $view['board']['press_release_content']; ?></td>
    </tr>
    <tr>
        <th>언론사 링크</th>
        <td><a href="<?php echo 'http://'.$view['board']['press_release_link'];?>"><?php echo $view['board']['press_release_link'];?></a></td>
    </tr>
</table>
<br>
<div class="btn-group pull-right" role="group" aria-label="...">
    <a onclick="history.back()" class="btn btn-outline btn-danger btn-sm">목록</a>
</div>
</div>
</div>