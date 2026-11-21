import { useState, useEffect } from 'react'
import { CustomControlsProvider } from '@rahilp010/custom-control'
import { useFormStore } from './Store/formStore'
import Header from './Components/Layout/Header'
import Dashboard from './Components/Dashboard/Dashboard'
import Sidebar from './Components/Sidebar/Sidebar'
import Canvas from './Components/Canvas/Canvas'
import PropertiesPanel from './Components/Properties/PropertiesPanel'
import FormPreview from './Components/Preview/FormPreview'
import FormResponses from './Components/Responses/FormResponses'
import PublicFormFill from './Components/Public/PublicFormFill'
import SaveModal from './Components/SaveModal/SaveModal'
import ViewSwitcher from './Components/Layout/ViewSwitcher'

export default function App() {
  const theme = useFormStore((s) => s.theme)
  const activeView = useFormStore((s) => s.activeView)
  const showProperties = useFormStore((s) => s.showProperties)
  const selectedFieldId = useFormStore((s) => s.selectedFieldId)

  // Listen for #fill=<formId> in URL for standalone respondent mode
  const [fillFormId, setFillFormId] = useState(() => {
    const hash = window.location.hash
    if (hash && hash.startsWith('#fill=')) {
      return hash.replace('#fill=', '')
    }
    const params = new URLSearchParams(window.location.search)
    return params.get('fill')
  })

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash
      if (hash && hash.startsWith('#fill=')) {
        setFillFormId(hash.replace('#fill=', ''))
      } else {
        setFillFormId(null)
      }
    }
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  return (
    <CustomControlsProvider
      theme={theme}
      colors={{ primary: '#2f5d46' }}
    >
      <div
        data-theme={theme}
        className="min-h-screen flex flex-col overflow-hidden"
        style={{ background: 'var(--bg)', color: 'var(--text-primary)' }}
      >
        {/* If in public respondent fill mode, render the public form view */}
        {fillFormId ? (
          <PublicFormFill targetFormId={fillFormId} />
        ) : (
          <div className="h-screen flex flex-col overflow-hidden">
            <Header />

            {activeView === 'dashboard' && <Dashboard />}

            {activeView === 'editor' && (
              <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <Canvas />
                {showProperties && selectedFieldId && <PropertiesPanel />}
              </div>
            )}

            {activeView === 'preview' && <FormPreview />}

            {activeView === 'responses' && <FormResponses />}

            {/* Floating iOS-style dock — dashboard navigation */}
            {activeView === 'dashboard' && <ViewSwitcher variant="dock" />}

            {/* Save & Share Modal */}
            <SaveModal />
          </div>
        )}
      </div>
    </CustomControlsProvider>
  )
}
