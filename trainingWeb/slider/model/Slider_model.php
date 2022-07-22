<?php
defined('BASEPATH') or exit('No direct script access allowed');

/**
 * Tempsave model class
 *
 * Copyright (c) CIBoard <www.ciboard.co.kr>
 *
 * @author CIBoard (develop@ciboard.co.kr)
 */

class Slider_model extends CB_Model
{
    
    /**
     * 테이블명
     */
    public $img_table = 'slider';
    /**
     * 사용되는 테이블의 프라이머리키
     */
    public $primary_key = 'offi_num'; // 사용되는 테이블의 프라이머리키

    public function __construct()
    {
        parent::__construct();
    }

    public function code_select()
    {
        $where_live = array('offi_code' => 1);
        $this->db->from($this->_table);
        $this->db->where($where_live);
        $count = $this->db->count_all_results();

        for ($i=0;$i<$count;$i++) {
            $this->db->from($this->_table);
            $this->db->where($where_live);
            $json_tmp = $this->db->get()->row($i);
            $tmp = json_encode($json_tmp);
            $count_code[$i] = json_decode($tmp, true);
        }
        
        $count_code['count'] = $count;
        return $count_code;
    }

    public function area_code_select()
    {
        $where_live = array('ac_use' => 1);
        $this->db->from($this->area_table);
        $this->db->where($where_live);
        $count = $this->db->count_all_results();

        $this->db->from($this->area_table);
        $this->db->where($where_live);
        $json_tmp = $this->db->get();
        $tmp = json_encode($json_tmp->result());
        $count_code = json_decode($tmp, true);

        
        
        $count_code['count'] = $count;
        return $count_code;
    }

    
    public function sub_area_code_select()
    {
        $where_live = array('ac_use' => 1);
        $this->db->from($this->area_table);
        $this->db->where($where_live);
        $area_count = $this->db->count_all_results();

        $this->db->from($this->area_table);
        $this->db->where($where_live);
        $json_tmp = $this->db->get();
        $tmp = json_encode($json_tmp->result());
        $area_count_code = json_decode($tmp, true);


        $where_live = array('sac_use' => 1);
        $this->db->from($this->sub_area_table);
        $this->db->where($where_live);
        $count = $this->db->count_all_results();

        

        for ($i=0;$i<$area_count;$i++) {
            $where_sub = array('sac_use' => 1, 'sac_code' => $area_count_code[$i]['ac_code']);
            $this->db->from($this->sub_area_table);
            $this->db->where($where_sub);
            $json_tmp = $this->db->get();
            
            $tmp = json_encode($json_tmp->result());
            $count_code[$i] = json_decode($tmp, true);
        }

        
        $count_code['count'] = $count;
        return $count_code;
    }

    public function insert_image($insert_data)
    {
        $this->db->insert('slider', $insert_data);
        return true;
    }

    public function delete_table()
    {
        $this->db->truncate('slider');
        return true;
    }

    public function img_select()
    {
        $this->db->from($this->img_table);
        $json_tmp = $this->db->get();
        $tmp = json_encode($json_tmp->result());
        $img_data = json_decode($tmp, true);
        

        return $img_data;
    }

    public function img_news_select()
    {
        $json_tmp = $this->db->query("SELECT post_id AS id, post_title AS title, post_content AS content, post_regdatetime AS date_time, post_thumbnail_file AS file_path, post_menu_code AS menu FROM TB_board_common WHERE post_menu_code = '4' OR post_menu_code = '5' OR post_menu_code = '12' ORDER BY post_regdatetime DESC limit 2");
        $tmp = json_encode($json_tmp->result());
        $news_data = json_decode($tmp, true);

        return $news_data;
    }

    public function news_select()
    {
        $json_tmp = $this->db->query(
            "SELECT * from(SELECT post_id AS id, post_title AS title, post_content AS content, post_regdatetime AS date_time, post_thumbnail_file AS file_path, post_menu_code AS menu  FROM TB_board_common WHERE post_menu_code = '4' OR post_menu_code = '5' OR post_menu_code = '11' OR post_menu_code = '12' ORDER BY post_regdatetime DESC LIMIT 5 )TB_board_common
            UNION
            SELECT post_id AS id, post_title AS title, post_content AS content, post_regdatetime AS date_time, post_upload_file AS file_path, '13' AS menu FROM TB_board_ambassador_journal 
            ORDER BY date_time DESC LIMIT 7"
        );
        
        $tmp = json_encode($json_tmp->result());
        $list = json_decode($tmp, true);

        return $list;
    }

    public function business_select()
    {
        $json_tmp = $this->db->query(
            "SELECT
            post_id AS id, post_title AS title, post_content AS content, post_regdatetime AS date_time, post_thumbnail_file AS file_path, post_menu_code AS menu 
        from(
            select
                *
            from TB_board_common
            where (post_menu_code, post_regdatetime) in (
                select post_menu_code, max(post_regdatetime) as post_regdatetime
                from TB_board_common WHERE post_menu_code = '6' OR post_menu_code = '7' OR post_menu_code = '8' OR post_menu_code = '9' OR post_menu_code = '10' group by post_menu_code
            )
            order by post_regdatetime DESC
        ) t group by t.post_menu_code  
        order by t.post_menu_code*1 
            "
        );
        
        $tmp = json_encode($json_tmp->result());
        $list = json_decode($tmp, true);

        return $list;
    }

    public function vimeo_select()
    {
        $json_tmp = $this->db->query(
            "SELECT post_videoid AS id, post_vod_title AS title, post_thumbnail AS path, post_upload_file AS upload_path FROM TB_video WHERE post_vod_type = 'VM'  ORDER BY post_regdatetime DESC LIMIT 5
            "
        );
        
        $tmp = json_encode($json_tmp->result());
        $list = json_decode($tmp, true);

        return $list;
    }

    public function youtube_select()
    {
        $json_tmp = $this->db->query(
            "SELECT post_videoid AS id, post_vod_title AS title, post_thumbnail AS path, post_upload_file AS upload_path, post_vod_contents AS contents  FROM TB_video WHERE post_vod_type = 'YT'  ORDER BY post_regdatetime DESC LIMIT 5
            "
        );
        
        $tmp = json_encode($json_tmp->result());
        $list = json_decode($tmp, true);

        return $list;
    }
}
