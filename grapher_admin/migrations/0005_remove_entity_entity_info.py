# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2017-06-18 17:13
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('grapher_admin', '0004_entity_entity_info'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='entity',
            name='entity_info',
        ),
    ]
