module.exports = {
  when: {
    "build_status": "failed"
  },
  map: {
    "title": "{{project_name}}",
    "message": "Build Failed",
    "timestamp": "{{build_finished_at.getTime()}}",
    "url": "{{gitlab_url}}/builds/{{build_id}}",
    "url_title": "View Build Log"
  }
};
