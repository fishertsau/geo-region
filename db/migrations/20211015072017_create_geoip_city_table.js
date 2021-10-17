exports.up = function (knex) {
  return knex.schema
    .createTable('geoip_city', function (table) {
      table.bigInteger('id').unsigned().notNullable();
      table.bigInteger('region_id').unsigned().notNullable().comment('區域序號');
      table.string('country').notNullable().comment('國家代碼');
      table.string('region').notNullable().comment('區域代碼');
      table.string('city').notNullable().comment('城市代碼');
      table.string('en_name').notNullable().comment('英文名稱');
      table.string('zh_tw_name').notNullable().comment('繁中名稱');
      table.string('zh_cn_name').notNullable().comment('簡中名稱');
    });
};

exports.down = function (knex) {
  return knex.schema
    .dropTable('geoip_city');
};
