<?php
defined('BASEPATH') or exit('No direct script access allowed');

/**
 * Popup class
 *
 * Copyright (c) CIBoard <www.ciboard.co.kr>
 *
 * @author CIBoard (develop@ciboard.co.kr)
 */

require_once(APPPATH.'core/CB_Adminmenu.php');
class Slider extends CB_Adminmenu
{
    public $pagedir = 'page/slider';

    protected $models = array('Slider','press_release');


    protected $helpers = array('form', 'array', 'dhtml_editor');

    public function __construct()
    {
        parent::__construct();

        $this->load->library(array('pagination', 'querystring', 'form_validation', 'member'));
    }

    
    public function index()
    {
        $layoutconfig = array(
            'layout' => 'layout',
            'skin' => 'index',
        );

        

        $view['view']['board']      = $result['list'];


        if (($view['view']['page_control']*10)+10 < $view['view']['maxpage']) {
            $view['view']['limitpage'] = ($view['view']['page_control']*10)+10 ;
        }

        $img_code = $this->Slider_model->img_select();
        $view['img_code'] = $img_code;

        
        $view['layout'] = $this->managelayout->admin($layoutconfig, $this->cbconfig->get_device_view_type());
        
        $this->data = $view;
        $this->layout = element('layout_skin_file', element('layout', $view));
        $this->view = element('view_skin_file', element('layout', $view));
        $this->view = element('view_skin_file', element('layout', $view));

        check_admin_menu();
    }

    public function regist()
    {
        $this->Slider_model->delete_table();

        $count = $this->input->post('count');
        $count_tmp = $this->input->post('count_tmp');
        for ($i=1; $i < $count_tmp+1; $i++) {
            if ($this->input->post('check'.$i) != null) {
                $file_name = $this->input->post('img'.$i.'_random');
                $tmp_file = $_FILES['image'.$i]['tmp_name'];
                
                $file_path = 'assets/img/slider/'.$file_name;
                
                move_uploaded_file($tmp_file, $file_path);

                $title = $this->input->post('img'.$i.'_log');
                $path = base_url($this->input->post('img'.$i.'_log'));
                $image_data = array(
                    'SD_img' => $this->input->post('img'.$i.'_random'),
                    'SD_link' => $this->input->post('link'.$i),
                    'SD_title' => $title,
                    'SD_text' => $this->input->post('text'.$i),
                    'SD_sub_text' => $this->input->post('sub_text'.$i)
                );
                
                $this->Slider_model->insert_image($image_data);
            }
        }



        alert('등록이 완료 되었습니다.', base_url('admin/page/slider/index'));
    }
}
