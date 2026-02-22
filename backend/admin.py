from sqladmin import Admin, ModelView
from database import engine
from models import Project, Task, Milestone
from main import app  # import FastAPI app

# Create Admin instance
admin = Admin(app, engine)

class ProjectAdmin(ModelView, model=Project):
    column_list = "__all__"

class TaskAdmin(ModelView, model=Task):
    column_list = "__all__"

class MilestoneAdmin(ModelView, model=Milestone):
    column_list = "__all__"

admin.add_view(ProjectAdmin)
admin.add_view(TaskAdmin)
admin.add_view(MilestoneAdmin)