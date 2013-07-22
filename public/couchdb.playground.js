$( document ).ready(function(){
  $("[data-request]").on("click", function(){
      postRequest($(this).attr("data-request"));
  });
});

function postRequest(path){
  $.get(path, function(data) {
    $('.result').html(data);
  }).fail(function(data) { $('.result').html(data.responseText);});
}

