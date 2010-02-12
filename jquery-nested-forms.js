/*
 * jQuery Nested Forms Plugin
 * version: 1.0.0 (2010-02-12)
 * @requires jQuery v1.4.0 or later
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 *
 * http://github.com/andyferra/nested-forms
 */

;(function($) {

  $.fn.has_nested_forms = function(nested_form_selector, options) {
    
    return this.each(function(){

      var parent  = this;
      var $parent = $(parent);
     
      var defaults = {
        name                  : inferred_name(),
        add_href_selector     : inferred_add_selector(),
        remove_href_selector  : inferred_remove_selector(),
        delete_field_selector : null,
        focus_field_selector  : 'input[type!=submit][type!=radio][type!=checkbox]:visible:first',
        depth                 : 1,
        cycle_classes         : ['odd', 'even'],
        enable_keyboard       : true,
        always_show_one       : true,
        after_add             : function(){},
        after_remove          : function(){}
      }

      var opts = $.extend(defaults, options);

      $(opts.add_href_selector).live('click', function(){
        create_clone();
        return false;
      });

      $parent.find(nested_form_selector).live('keydown', function(event){
        if (opts.enable_keyboard){
          if (event.keyCode == 13 && event.shiftKey) {
            create_clone();
            return false;
          }
        }
      });

      $(opts.remove_href_selector).live('click', function(){
        var deleted = $(this).parents(nested_form_selector);
        deleted.find(delete_field_selector()).val(1);
        deleted.hide();
        cycle_classes();
        opts.after_remove.call(deleted);
        if (opts.always_show_one && $parent.find(nested_form_selector+':visible').length == 0) {
          create_clone();
        }
        return false;
      });

      function delete_field_selector(){
        if (opts.delete_field_selector) return opts.delete_field_selector;

        if ($parent.find(nested_form_selector).find('input[id$="_destroy"]').length) {
          return 'input[id$="_destroy"]';
        } else {
          return 'input[id$="_delete"]';
        }
      }

      function create_clone(){
      
        var new_nested_form = $parent.find(nested_form_selector+':first').clone().show();
        
        // clear the form
        new_nested_form.find('input[type=text], select, textarea').val('');
        new_nested_form.find('input[type=checkbox]').attr('checked', false);
        new_nested_form.find('input[type=radio]').attr('checked', false);
        new_nested_form.find('input[type=radio]:first').attr('checked', true);
        
        // update the field indices
        var new_item_index = $parent.find(nested_form_selector).length;
        new_nested_form.find('input, textarea, select').each(function(){
          var name_nth_count = 0;
          $(this).attr('name', $(this).attr('name').replace(/\[\d+\]/g, function(str){
            name_nth_count++;
            return (name_nth_count == opts.depth) ? '['+new_item_index+']' : str;
          }));
          var id_nth_count = 0;
          $(this).attr('id', $(this).attr('id').replace(/_\d+_/g, function(str){
            id_nth_count++;
            return (id_nth_count == opts.depth) ? '_'+new_item_index+'_' : str;
          }));
        });
        new_nested_form.find('label').each(function(){
          var for_nth_count = 0;
          $(this).attr('for', $(this).attr('for').replace(/_\d+_/g, function(str){
            for_nth_count++;
            return (for_nth_count == opts.depth) ? '_'+new_item_index+'_' : str;
          }));
        });

        $parent.append(new_nested_form);
        focus_on_first_field(new_nested_form);
        cycle_classes();
        opts.after_add.call(new_nested_form);
      }

      function focus_on_first_field(nested_form){
        if (opts.focus_field_selector) {
          nested_form.find(opts.focus_field_selector).focus();
        }
      }

      function cycle_classes(){
        if (opts.cycle_classes) {
          var current_cycle_index = 0;
          $parent.find(nested_form_selector+':visible').each(function(){
            $(this).removeClass(opts.cycle_classes.join(" "));
            $(this).addClass(opts.cycle_classes[current_cycle_index]);
            current_cycle_index = (current_cycle_index == opts.cycle_classes.length-1) ? 0 : current_cycle_index+1;
          });
        }
      }

      function inferred_name(){
        return nested_form_selector.replace('.', '');
      }
      
      function inferred_add_selector(){
        return 'a[href="#add_'+inferred_name()+'"]';
      }

      function inferred_remove_selector(){
        return 'a[href="#remove_'+inferred_name()+'"]';
      }

      cycle_classes();
    });
  }
})(jQuery);
