import { Button } from '../components/common/Button'
import { EmptyState } from '../components/common/EmptyState'

export function CreatePostPage() {
  return (
    <div>
      <EmptyState
        title="Create a post"
        description="Add media, caption, and set audience: public teaser or subscribers (mock form)."
        action={
          <Button
            type="button"
            variant="primary"
            onClick={() => window.alert('Not wired in this build')}
          >
            Upload
          </Button>
        }
      />
    </div>
  )
}
