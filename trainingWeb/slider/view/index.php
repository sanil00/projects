<link rel="stylesheet" type="text/css" href="<?php echo base_url('views/admin/basic/page/officials/css/custom_common.css'); ?>" />
<link rel="stylesheet" type="text/css" href="<?php echo base_url('views/admin/basic/page/slider/css/slider.css'); ?>" />
<!-- <link href="https://stackpath.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css" rel="stylesheet"> -->
<!-- <script src="https://stackpath.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js"></script> -->
<!-- include summernote css/js -->
<link href="https://cdn.jsdelivr.net/npm/summernote@0.8.18/dist/summernote.min.css" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/summernote@0.8.18/dist/summernote.min.js"></script>

<div class="box" style="max-width:1320px;">
    <div class="box-table-header">
        <div class="panel with-nav-tabs panel-primary">
            <div class="panel-heading">
                <ul class="nav nav-tabs">
                    <li class="active"><a>슬라이더</a></li>
                </ul>
            </div>
            <?php
            $attributes = array('method'=>'post', 'enctype' => 'multipart/form-data' ,'name' => 'slider', 'id' => 'slider');
            echo form_open('admin/page/slider/regist', $attributes);
            
            ?>
            <div class="panel-body">
                <div class="tab-content">
                    <div class="tab-pane fade in active field" id="tab2primary">
<?php


for ($i=0;$i<count($img_code);$i++) {
    echo('
        <div class="slider_container slider slider'.($i+1).'" id="slider'.($i+1).'">
            <div class="title_box" >
                <div class="slide_number">'.($i+1).'번 슬라이드</div>
                <button onclick="delete_container(this.id);" id="'.($i+1).'" class="button_shape_del btn btn-danger btn-sm" value="제거">제거</button>
            </div>    
            <div class="slider_elem">
                <div class="title">타이틀</div>
                <div class="contents"><textarea name="text'.($i+1).'" id="text'.($i+1).'" onkeyup="text_display(this.id)">'.$img_code[$i]['SD_text'].'</textarea> </div>
            </div>
            <div class="slider_elem">
                <div class="title">서브타이틀</div>
                <div class="contents"><textarea name="sub_text'.($i+1).'" id="sub_text'.($i+1).'" onkeyup="sub_text_display(this.id)">'.$img_code[$i]['SD_sub_text'].'</textarea> </div>
            </div>
            <div class="slider_elem">
                <div class="title">링크</div>
                <div class="contents"><input type="text" name="link'.($i+1).'"  id="link'.($i+1).'" value="'.$img_code[$i]['SD_link'].'" onkeyup="link_display(this.id)"></div>
            </div>
            <div class="slider_elem">
                <div class="title">이미지</div>
                <div class="contents">
                    <input type="file" style="display:none;" name="image'.($i+1).'" id="img'.($i+1).'" onchange="img_preview(event, this.id); " accept="image/*">
                    <label for="img'.($i+1).'" style="margin:0;" class="img_label button_shape btn btn-outline btn-sm btn_add" >이미지</label>
                    <input type="text" name="img'.($i+1).'_log" class="img_log" id="img'.($i+1).'_log" value="'.$img_code[$i]['SD_title'].'" readonly>
                    <input type="hidden" name="img'.($i+1).'_random" id="img'.($i+1).'_random" value="'.$img_code[$i]['SD_img'].'" readonly>
                    <input type="hidden" name="check'.($i+1).'" value="'.($i+1).'" readonly>
                </div>
            </div>
            <div class="slider_elem">
                <div class="title">결과</div>
                <div class="contents">
                    <div id="img'.($i+1).'_field" class="img_field"><img src="'.base_url('assets/img/slider/'.$img_code[$i]['SD_img']).'"></div>
                        <div class="text">
                            <div class="text_box" id="text'.($i+1).'_box">
                                <pre>'.$img_code[$i]['SD_text'].'</pre>
                            </div>
                            <div id="sub_text'.($i+1).'_box">
                                <pre>'.$img_code[$i]['SD_sub_text'].'</pre>
                            </div>
                            <a id="link'.($i+1).'_box" href="'.$img_code[$i]['SD_link'].'" target="_blank">자세히보기</a>
                        </div>
                    </div>
            </div>
        </div>');
} ?>
                    </div>
                    <input type="hidden" name="count" id="count">
                    <input type="hidden" name="count_tmp" id="count_tmp">
                </div>
            </div>
            <input type="submit" class="button_shape btn btn-outline btn-success btn-sm" onclick="check_value()" value="업로드">
            <?php echo form_close(); ?>
            <button onclick="delete_all_container();" style="padding: 5px 6px;" class="button_shape btn btn-danger btn-sm" value="모두제거">모두제거</button>
            <button onclick="add_container();"  class="button_shape btn btn-outline btn-sm btn_add" value="추가">추가</button>
        </div>
    </div>
</div>

<script>

    let count = <?php echo count($img_code); ?>+1;
    let count_tmp = <?php echo count($img_code); ?>;



    const add_container = function () {

        while(document.querySelector('.slider'+count) != null) {
            count= count+1;
        }
        
        const field = document.querySelector('.field');
        let el = document.createElement("div");

        el.setAttribute('class',`slider_container slider slider${count}`);
        el.setAttribute('id',`slider${count}`);
        el.innerHTML = `
        <div class="title_box" >
            <div class="slide_number">${count}번 슬라이드</div>
            <button onclick="delete_container(this.id);" id="${count}" class="button_shape_del btn btn-danger btn-sm" value="제거">제거</button>
        </div>    
        <div class="slider_elem">
            <div class="title">타이틀</div>
            <div class="contents"><textarea name="text${count}" id="text${count}" onkeyup="text_display(this.id)"></textarea> </div>
        </div>
        <div class="slider_elem">
            <div class="title">서브타이틀</div>
            <div class="contents"><textarea name="sub_text${count}" id="sub_text${count}" onkeyup="sub_text_display(this.id)"></textarea> </div>
        </div>
        
        <div class="slider_elem">
            <div class="title">링크</div>
            <div class="contents"><input type="text" name="link${count}"  id="link${count}" onkeyup="link_display(this.id)"></div>
        </div>
        <div class="slider_elem">
            <div class="title">이미지</div>
            <div class="contents">
                <input type="file" style="display:none;" name="image${count}" id="img${count}" onchange="img_preview(event, this.id); " accept="image/*">
                <label for="img${count}" style="margin:0;" class="img_label button_shape btn btn-outline btn-sm btn_add" >이미지</label>
                <input type="text" name="img${count}_log" class="img_log" id="img${count}_log" readonly>
                <input type="hidden" name="img${count}_random" id="img${count}_random" readonly>
                <input type="hidden" name="check${count}" value="${count}" readonly>
            </div>
        </div>
        <div class="slider_elem">
            <div class="title">결과</div>
            <div class="contents">
                <div id="img${count}_field" class="img_field"></div>
                <div class="text" id="text${count}_box">
                    <div class="text_box">
                    </div>
                    <div id="sub_text${count}_box"><pre></pre>
                    </div>
                    <a href="" target="_blank" id="link${count}_box">자세히보기</a>
                </div>
            </div>
        </div>
        
        `;
        if(field.children[count-1] === undefined){
            field.appendChild(el);
        } else {
            field.insertBefore(el,field.children[count-1]);
        }
                        

        count = count +1;
    }

    const delete_container = function (id) {
        const field = document.querySelector('.field');
        const el = document.querySelector(`.slider${id}`);

        field.removeChild(el);
        // count = Number(id);
        count = 1;
    }

    const delete_all_container = function (id) {
        const field = document.querySelector('.field');

        field.innerHTML = '';
        // count = Number(id);
        count = 1;
    }


    const img_preview = function(event, id) {
        let reader = new FileReader();

        reader.onload = function(event){
            let img = document.createElement("img");
            img.setAttribute("src",event.target.result);
            if(document.getElementById(id+"_field").firstChild != null){
                document.getElementById(id+"_field").removeChild(document.getElementById(id+"_field").firstChild);
            }
            document.getElementById(id+"_field").appendChild(img);
        }
        document.getElementById(id+"_log").value = event.target.files[0]['name'];

        let str = event.target.files[0]['name'].split('.');
        min = 1000000000000;
        max = 9999999999999;
        min = Math.ceil(min);
        max = Math.floor(max);
        random = Math.floor(Math.random() * (max - min)) + min; //최댓값은 제외, 최솟값은 포함

        document.getElementById(id+"_random").value = random+'.'+str[1];
        reader.readAsDataURL(event.target.files[0]);
    }

    

    const check_value = function () {
        let count_data = document.getElementById('count');
        let count_tmp_data = document.getElementById('count_tmp');
        let send_count = document.getElementsByClassName('slider_container');
        count_data.value = send_count.length;
        
        const field = document.querySelector('.field');
        count_tmp = field.lastElementChild.children[0].children[1].id;
        count_tmp_data.value = count_tmp;
    }

    const excapeHtml = function(str) {
	var map = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#039;',
        '\n': '<br>'
	};
	return str.replace( /[&<>"']/g, function(m){ return map[m]; });
}

    const text_display = function(id) {
        const text_display = document.getElementById(id);
        const text_box = document.getElementById(id+'_box');
        const val = excapeHtml(text_display.value);
        console.log(val);
        text_box.children[0].innerHTML = val;
    }

    const sub_text_display = function(id) {
        const sub_text_display = document.getElementById(id);
        const text_box = document.getElementById(id+'_box');
        text_box.children[0].innerHTML = sub_text_display.value;
    }

    const link_display = function(id) {
        const link_display = document.getElementById(id);
        const link_box = document.getElementById(id+'_box');
        link_box.href = link_display.value;

        if(link_display.value == ""){
            link_box.style.display = "none";
        } else{
            link_box.style.display = "inline-block";
        }
    }
</script>
