from django.db.models import Q
from rest_framework import generics, permissions, viewsets

from .models import Task
from .serializers import RegisterSerializer, TaskSerializer


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Task.objects.filter(owner=self.request.user)
        status_filter = self.request.query_params.get("status")
        priority_filter = self.request.query_params.get("priority")
        search = self.request.query_params.get("search")

        if status_filter and status_filter != "all":
            queryset = queryset.filter(status=status_filter)
        if priority_filter and priority_filter != "all":
            queryset = queryset.filter(priority=priority_filter)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(description__icontains=search)
            )

        return queryset

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
