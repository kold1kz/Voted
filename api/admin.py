from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.hashers import make_password
from django import forms
from django.core.exceptions import ValidationError
from api.models import Candidate, Consigment, Protocol, RefreshTokens, Result, User, VotingArea, TimeTurnout, VotingDate
from import_export.admin import ImportExportActionModelAdmin
from import_export import resources
from import_export import fields
from import_export.widgets import ForeignKeyWidget


class UserCustomAdminResource(resources.ModelResource):
    def before_import_row(self, row, **kwargs):
        value = row['password']
        row['password'] = make_password(value)

    class Meta:
        model = User


class UserCustomAdmin(UserAdmin, ImportExportActionModelAdmin):
    def delete_model(self, request, obj):
        if request.user.login != obj.login:
            obj.delete()

        return

    def delete_queryset(self, request, queryset):
        for obj in queryset:
            if request.user.login != obj.login:
                obj.delete()

            return

    resource_class = UserCustomAdminResource
    ordering = ('login',)
    list_display = ('id', 'email', 'login', 'userType', 'date_joined')
    search_fields = ('email', 'login',)
    readonly_fields = ('date_joined', 'last_login',)
    filter_horizontal = ()
    fieldsets = ((None, {
        'fields': (
            'login', 'email', 'password', "userType", "is_admin",
            "last_login",

        )
    }),)
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'login', "userType", "is_admin", 'password1', 'password2'),
        }),
    )
    list_filter = ('userType',)
    filter_horizontal = ()


class RefreshTokensAdmin(admin.ModelAdmin):
    list_display = ('userId', 'refreshToken', 'created_at', 'expiresIn')
    readonly_fields = ('refreshToken', 'userId',)
    fieldsets = ((None, {
        'fields': (
            'refreshToken',
            'expiresIn',
            'userId',

        )
    }),)
    filter_horizontal = ()


class VotingDateAdmin(admin.ModelAdmin):
    list_display = ('id', 'date')
    filter_horizontal = ()


class ProtocolResource(resources.ModelResource):
    class Meta:
        model = Protocol


class ProtocolAdmin(ImportExportActionModelAdmin):
    resource_class = ProtocolResource
    list_display = ('voting_area','number_of_voters', 'number_of_bulletins',
                    'spoiled_bulletins', 'valid_bulletins')
    filter_horizontal = ()


class VotingAreaResource(resources.ModelResource):
    user = fields.Field(column_name='user', attribute='user',
                        widget=ForeignKeyWidget(User, 'login'))

    class Meta:
        model = VotingArea


class VotingAreaAdmin(ImportExportActionModelAdmin):
    resource_class = VotingAreaResource
    list_display = ('num_voting_area', 'district',
                    'is_opened', 'max_people', 'count_voters', 'user')
    search_fields = ('district', 'num_voting_area')
    list_filter = ('is_opened',)
    filter_horizontal = ()


class ConsigmentResource(resources.ModelResource):
    class Meta:
        model = Consigment


class ConsigmentAdmin(ImportExportActionModelAdmin):
    resource_class = ConsigmentResource
    list_display = ('id', 'name',)
    filter_horizontal = ()


class CandidateResource(resources.ModelResource):
    consigment = fields.Field(column_name='consigment', attribute='consigment',
                              widget=ForeignKeyWidget(Consigment, 'name'))

    class Meta:
        model = Candidate

    def before_import(self, dataset, using_transactions, dry_run, **kwargs):
        for row in dataset:
            if row[0] and int(row[4]):
                raise ValidationError(f"Кандидат не может состоять в партии и быть самовыдвиженцем одновременно"
                                      f" Ошибка у кандидата с именем   {row[2]}")

class CandidateAdminForm(forms.ModelForm):
    class Meta:
        model = Candidate
        fields = "__all__"

    def clean(self):
        cleaned_data = super(CandidateAdminForm, self).clean()
        consigment = cleaned_data.get("consigment")
        is_self_promoted = cleaned_data.get("is_self_promoted")

        if consigment and is_self_promoted:
                raise forms.ValidationError(
                    "Кандидат не может состоять в партии и быть самовыдвиженцем одновременно"
                )

class CandidateAdmin(ImportExportActionModelAdmin):
    form = CandidateAdminForm
    resource_class = CandidateResource
    list_display = ('id', 'photo', 'full_name',
                    'is_self_promoted', 'consigment')
    search_fields = ('full_name',)
    list_filter = ('consigment', 'is_self_promoted')
    filter_horizontal = ()


class ResultResource(resources.ModelResource):
    candidate = fields.Field(column_name='candidate', attribute='candidate',
                             widget=ForeignKeyWidget(Candidate, 'full_name'))

    class Meta:
        model = Result


class ResultAdmin(ImportExportActionModelAdmin):
    resource_class = ResultResource
    list_display = ('id', 'count_votes', 'candidate',)
    filter_horizontal = ()


class TimeTurnoutResource(resources.ModelResource):
    num_voting_area = fields.Field(column_name='num_voting_area', attribute='num_voting_area',
                                   widget=ForeignKeyWidget(VotingArea, 'num_voting_area'))

    class Meta:
        model = TimeTurnout


class TimeTurnoutAdmin(ImportExportActionModelAdmin):
    resource_class = TimeTurnoutResource
    list_display = ('id', 'voting_area', 'add_time',
                    'client_add_time', 'count_voters')
    exclude = ('add_time',)
    list_filter = ('client_add_time',)
    filter_horizontal = ()


class AdminSite(admin.AdminSite):
    site_title = 'Выборы мэра Москвы'
    site_header = 'Выборы'
    index_title = 'Панель администрирования'

    def get_app_list(self, request):
        app_dict = self._build_app_dict(request)
        app_list = sorted(app_dict.values(), key=lambda x: x['name'].lower())
        return app_list


admin.site = AdminSite()

# Register your models here.
admin.site.register(User, UserCustomAdmin)
admin.site.register(RefreshTokens, RefreshTokensAdmin)
admin.site.register(Protocol, ProtocolAdmin)
admin.site.register(VotingArea, VotingAreaAdmin)
admin.site.register(Consigment, ConsigmentAdmin)
admin.site.register(Candidate, CandidateAdmin)
admin.site.register(Result, ResultAdmin)
admin.site.register(TimeTurnout, TimeTurnoutAdmin)
admin.site.register(VotingDate, VotingDateAdmin)
