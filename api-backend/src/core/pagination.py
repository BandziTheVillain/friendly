from rest_framework.pagination import PageNumberPagination

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
    page_query_param = 'page'          # Change ?page=4 to a custom name like ?p=4
    page_size_query_param = 'page_size'  # Allow client to pass ?page_size=20
    max_page_size = 30                # Prevent requesting huge page sizes
