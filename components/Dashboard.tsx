"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Home, Briefcase, User, LogOut, Menu, ChevronLeft, ChevronRight, Bell } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

type User = {
  id: string
  name: string
  email: string
  type: "cliente" | "prestador"
}

type Category = {
  name: string
  subcategories: string[]
}

type Publication = {
  id: string
  title: string
  description: string
  category: string
  subcategory: string
  type: "servicio" | "solicitud"
  provider?: string
  client?: string
  status?: "pending" | "in_progress" | "completed"
  createdBy: string // Nuevo campo añadido
}

type Notification = {
  id: string
  message: string
  read: boolean
  publicationId: string
  userId: string // Añadido para identificar a quién va dirigida la notificación
}

const categories: Category[] = [
  {
    name: "Tareas domésticas",
    subcategories: ["Limpieza", "Jardinería", "Reparaciones menores", "Lavandería", "Organización"]
  },
  {
    name: "Servicios profesionales",
    subcategories: ["Plomería", "Electricidad", "Carpintería", "Pintura", "Diseño gráfico"]
  },
  {
    name: "Asistencia personal",
    subcategories: ["Compras", "Trámites", "Cuidado de mascotas", "Transporte", "Organización de eventos"]
  },
  {
    name: "Cuidado de personas",
    subcategories: ["Cuidado de niños", "Cuidado de adultos mayores", "Cuidado de personas con discapacidad", "Enfermería", "Terapia"]
  },
  {
    name: "Servicios educativos",
    subcategories: ["Tutoría académica", "Clases de idiomas", "Clases de música", "Clases de arte", "Entrenamiento deportivo"]
  }
]

const initialPublications: Publication[] = [
  { id: "1", title: "Limpieza de hogar", description: "Limpieza profunda de casa de 3 habitaciones", category: "Tareas domésticas", subcategory: "Limpieza", type: "servicio", provider: "María Limpieza", createdBy: "2" },
  { id: "2", title: "Reparación de tubería", description: "Fuga en el baño principal", category: "Servicios profesionales", subcategory: "Plomería", type: "solicitud", client: "Juan Pérez", createdBy: "1" },
  { id: "3", title: "Paseo de perros", description: "Paseo diario de dos perros medianos", category: "Asistencia personal", subcategory: "Cuidado de mascotas", type: "servicio", provider: "Carlos Paseador", createdBy: "3" },
  { id: "4", title: "Cuidado de adulto mayor", description: "Acompañamiento y cuidado de adulto mayor", category: "Cuidado de personas", subcategory: "Cuidado de adultos mayores", type: "solicitud", client: "Ana Gómez", createdBy: "4" },
  { id: "5", title: "Clases de matemáticas", description: "Tutoría de matemáticas para nivel secundario", category: "Servicios educativos", subcategory: "Tutoría académica", type: "servicio", provider: "Prof. Rodríguez", createdBy: "5" },
]

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [publications, setPublications] = useState<Publication[]>(initialPublications)
  const [activeTab, setActiveTab] = useState("inicio")
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isNewPublicationModalOpen, setIsNewPublicationModalOpen] = useState(false)
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false)
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [subcategoryFilter, setSubcategoryFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<"all" | "servicio" | "solicitud">("all")
  const [selectedPublication, setSelectedPublication] = useState<Publication | null>(null)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [userSelections, setUserSelections] = useState<string[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false)

  const handleLogin = (email: string, password: string) => {
    const mockUser: User = { id: "1", name: "Usuario Ejemplo", email, type: "cliente" }
    setUser(mockUser)
    setIsLoginModalOpen(false)
  }

  const handleRegister = (name: string, email: string, password: string, type: "cliente" | "prestador") => {
    const mockUser: User = { id: "2", name, email, type }
    setUser(mockUser)
    setIsLoginModalOpen(false)
  }

  const handleLogout = () => {
    setUser(null)
    setActiveTab("inicio")
    setUserSelections([])
    setNotifications([])
  }

  const createPublication = (title: string, description: string, category: string, subcategory: string) => {
    if (!user) return
    const newPublication: Publication = {
      id: (publications.length + 1).toString(),
      title,
      description,
      category,
      subcategory,
      type: user.type === "prestador" ? "servicio" : "solicitud",
      ...(user.type === "prestador" ? { provider: user.name } : { client: user.name }),
      ...(user.type === "cliente" ? { status: "pending" } : {}),
      createdBy: user.id
    }
    setPublications([...publications, newPublication])
    setIsNewPublicationModalOpen(false)
  }

  const handleOffer = (publicationId: string, offerDetails: string) => {
    console.log(`Oferta para la publicación ${publicationId}: ${offerDetails}`)
    setUserSelections([...userSelections, publicationId])
    const publication = publications.find(pub => pub.id === publicationId)
    if (publication && user) {
      const newNotification: Notification = {
        id: (notifications.length + 1).toString(),
        message: `Nueva oferta de ${user.name} para tu solicitud: ${publication.title}`,
        read: false,
        publicationId: publicationId,
        userId: publication.createdBy // Enviamos la notificación al creador de la publicación
      }
      setNotifications([...notifications, newNotification])
    }
    setIsOfferModalOpen(false)
  }

  const handleRequest = (publicationId: string, requestDetails: string) => {
    console.log(`Solicitud para el servicio ${publicationId}: ${requestDetails}`)
    setUserSelections([...userSelections, publicationId])
    const publication = publications.find(pub => pub.id === publicationId)
    if (publication && user) {
      const newNotification: Notification = {
        id: (notifications.length + 1).toString(),
        message: `Nueva solicitud de ${user.name} para tu servicio: ${publication.title}`,
        read: false,
        publicationId: publicationId,
        userId: publication.createdBy // Enviamos la notificación al creador de la publicación
      }
      setNotifications([...notifications, newNotification])
    }
    setIsRequestModalOpen(false)
  }

  const filteredPublications = publications.filter(pub =>
    (categoryFilter === "all" || pub.category === categoryFilter) &&
    (subcategoryFilter === "all" || pub.subcategory === subcategoryFilter) &&
    (typeFilter === "all" || pub.type === typeFilter)
  )

  const userPublications = publications.filter(pub => pub.createdBy === user?.id)

  const selectedPublications = publications.filter(pub => userSelections.includes(pub.id))

  const userNotifications = notifications.filter(n => n.userId === user?.id)
  const unreadNotificationsCount = userNotifications.filter(n => !n.read).length

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className={`bg-white shadow-md transition-all duration-300 ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}>
        <div className="p-4 flex justify-between items-center">
          <h1 className={`font-bold ${isSidebarCollapsed ? 'text-lg' : 'text-2xl'}`}>
            {isSidebarCollapsed ? "TS" : "TuSolucion"}
          </h1>
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}>
            {isSidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
        <nav className="mt-6">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => setActiveTab("inicio")}
          >
            <Home className="h-4 w-4" />
            {!isSidebarCollapsed && <span className="ml-2">Inicio</span>}
          </Button>
          {user && (
            <>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => setActiveTab("publicaciones")}
              >
                <Briefcase className="h-4 w-4" />
                {!isSidebarCollapsed && <span className="ml-2">Mis Publicaciones</span>}
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => setActiveTab("perfil")}
              >
                <User className="h-4 w-4" />
                {!isSidebarCollapsed && <span className="ml-2">Perfil</span>}
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start relative"
                onClick={() => setIsNotificationModalOpen(true)}
              >
                <Bell className="h-4 w-4" />
                {!isSidebarCollapsed && <span className="ml-2">Notificaciones</span>}
                {unreadNotificationsCount > 0 && (
                  <Badge variant="destructive" className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2">
                    {unreadNotificationsCount}
                  </Badge>
                )}
              </Button>
            </>
          )}
        </nav>
        <div className="absolute bottom-4 left-4">
          {user ? (
            <Button variant="outline" onClick={handleLogout} className={isSidebarCollapsed ? "p-2" : ""}>
              <LogOut className="h-4 w-4" />
              {!isSidebarCollapsed && <span className="ml-2">Cerrar sesión</span>}
            </Button>
          ) : (
            <Button onClick={() => setIsLoginModalOpen(true)} className={isSidebarCollapsed ? "p-2" : ""}>
              <User className="h-4 w-4" />
              {!isSidebarCollapsed && <span className="ml-2">Iniciar sesión</span>}
            </Button>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {activeTab === "inicio" && (
          <Card>
            <CardHeader>
              <CardTitle>Publicaciones Recientes</CardTitle>
              <CardDescription>Explora servicios y solicitudes disponibles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4 mb-4">
                <Select onValueChange={(value) => setCategoryFilter(value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las categorías</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.name} value={category.name}>{category.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select onValueChange={(value) => setSubcategoryFilter(value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Subcategoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las subcategorías</SelectItem>
                    {categoryFilter !== "all" && categories.find(c => c.name === categoryFilter)?.subcategories.map((subcategory) => (
                      <SelectItem key={subcategory} value={subcategory}>{subcategory}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select onValueChange={(value) => setTypeFilter(value as "all" | "servicio" | "solicitud")}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los tipos</SelectItem>
                    <SelectItem value="servicio">Servicios</SelectItem>
                    <SelectItem value="solicitud">Solicitudes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPublications.map((pub) => (
                  <Card key={pub.id}>
                    <CardHeader>
                      <CardTitle>{pub.title}</CardTitle>
                      <CardDescription>{pub.category} - {pub.subcategory}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p>{pub.description}</p>
                      <p className="text-sm text-gray-500 mt-2">
                        {pub.type === "servicio" ? `Proveedor: ${pub.provider}` : `Cliente: ${pub.client}`}
                      </p>
                    </CardContent>
                    <CardFooter>
                      {user && (
                        (user.type === "cliente" && pub.type === "servicio") ||
                        (user.type === "prestador" && pub.type === "solicitud")
                      ) && (
                        <Button onClick={() => {
                          setSelectedPublication(pub)
                          if (pub.type === "servicio") {
                            setIsRequestModalOpen(true)
                          } else {
                            setIsOfferModalOpen(true)
                          }
                        }}>
                          {pub.type === "servicio" ? "Solicitar" : "Ofertar"}
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {user && activeTab === "publicaciones" && (
          <Card>
            <CardHeader>
              <CardTitle>Mis Publicaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userPublications.map((pub) => (
                  <Card key={pub.id}>
                    <CardHeader>
                      <CardTitle>{pub.title}</CardTitle>
                      <CardDescription>{pub.category} - {pub.subcategory}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p>{pub.description}</p>
                      {pub.type === "solicitud" && <p className="text-sm text-gray-500 mt-2">Estado: {pub.status}</p>}
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline">Editar</Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => setIsNewPublicationModalOpen(true)}>
                Crear nueva publicación
              </Button>
            </CardFooter>
          </Card>
        )}

        {user && activeTab === "perfil" && (
          <Card>
            <CardHeader>
              <CardTitle>Perfil de Usuario</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 mb-6">
                <Avatar>
                  <AvatarImage src="/placeholder-avatar.jpg" alt="Avatar" />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-semibold">{user.name}</h2>
                  <p className="text-gray-500">{user.type === "cliente" ? "Cliente" : "Prestador de servicios"}</p>
                  <p className="text-gray-500">{user.email}</p>
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-4">
                {user.type === "cliente"
                  ? "Servicios Solicitados"
                  : "Solicitudes Ofertadas"}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedPublications.map((pub) => (
                  <Card key={pub.id}>
                    <CardHeader>
                      <CardTitle>{pub.title}</CardTitle>
                      <CardDescription>{pub.category} - {pub.subcategory}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p>{pub.description}</p>
                      {pub.type === "solicitud" && <p className="text-sm text-gray-500 mt-2">Estado: {pub.status}</p>}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Login/Register Modal */}
      <Dialog open={isLoginModalOpen} onOpenChange={setIsLoginModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Iniciar Sesión / Registrarse</DialogTitle>
            <DialogDescription>Ingresa tus datos para acceder a la plataforma.</DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
              <TabsTrigger value="register">Registrarse</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <form onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                handleLogin(formData.get('email') as string, formData.get('password') as string)
              }} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <Input id="email" name="email" type="email" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input id="password" name="password" type="password" required />
                </div>
                <Button type="submit" className="w-full">Iniciar Sesión</Button>
              </form>
            </TabsContent>
            <TabsContent value="register">
              <form onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                handleRegister(
                  formData.get('name') as string,
                  formData.get('email') as string,
                  formData.get('password') as string,
                  formData.get('type') as "cliente" | "prestador"
                )
              }} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-name">Nombre</Label>
                  <Input id="register-name" name="name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email">Correo electrónico</Label>
                  <Input id="register-email" name="email" type="email" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">Contraseña</Label>
                  <Input id="register-password" name="password" type="password" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="user-type">Tipo de usuario</Label>
                  <select id="user-type" name="type" className="w-full p-2 border rounded">
                    <option value="cliente">Cliente</option>
                    <option value="prestador">Prestador de servicios</option>
                  </select>
                </div>
                <Button type="submit" className="w-full">Registrarse</Button>
              </form>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* New Publication Modal */}
      <Dialog open={isNewPublicationModalOpen} onOpenChange={setIsNewPublicationModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nueva Publicación</DialogTitle>
            <DialogDescription>Ingresa los detalles de tu nueva publicación.</DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault()
            const formData = new FormData(e.currentTarget)
            createPublication(
              formData.get('title') as string,
              formData.get('description') as string,
              formData.get('category') as string,
              formData.get('subcategory') as string
            )
          }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input id="title" name="title" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea id="description" name="description" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Categoría</Label>
              <Select name="category">
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.name} value={category.name}>{category.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subcategory">Subcategoría</Label>
              <Select name="subcategory">
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una subcategoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.flatMap(category =>
                    category.subcategories.map(subcategory => (
                      <SelectItem key={`${category.name}-${subcategory}`} value={subcategory}>{subcategory}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full">Crear Publicación</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Offer Modal */}
      <Dialog open={isOfferModalOpen} onOpenChange={setIsOfferModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hacer una Oferta</DialogTitle>
            <DialogDescription>Ingresa los detalles de tu oferta para esta solicitud.</DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault()
            const formData = new FormData(e.currentTarget)
            handleOffer(selectedPublication?.id || "", formData.get('offerDetails') as string)
          }} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="offerDetails">Detalles de la Oferta</Label>
              <Textarea id="offerDetails" name="offerDetails" required />
            </div>
            <Button type="submit" className="w-full">Enviar Oferta</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Request Modal */}
      <Dialog open={isRequestModalOpen} onOpenChange={setIsRequestModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Solicitar Servicio</DialogTitle>
            <DialogDescription>Confirma los detalles del servicio que deseas solicitar.</DialogDescription>
          </DialogHeader>
          {selectedPublication && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Servicio: {selectedPublication.title}</h3>
                <p>{selectedPublication.description}</p>
                <p className="text-sm text-gray-500">Proveedor: {selectedPublication.provider}</p>
              </div>
              <form onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                handleRequest(selectedPublication.id, formData.get('requestDetails') as string)
              }} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="requestDetails">Detalles adicionales (opcional)</Label>
                  <Textarea id="requestDetails" name="requestDetails" />
                </div>
                <Button type="submit" className="w-full">Confirmar Solicitud</Button>
              </form>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Notifications Modal */}
      <Dialog open={isNotificationModalOpen} onOpenChange={setIsNotificationModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Notificaciones</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[300px] w-full rounded-md border p-4">
            {userNotifications.length > 0 ? (
              userNotifications.map((notification) => (
                <div key={notification.id} className="mb-4 p-2 border-b last:border-b-0">
                  <p>{notification.message}</p>
                  <Button
                    variant="link"
                    onClick={() => {
                      const updatedNotifications = notifications.map(n =>
                        n.id === notification.id ? { ...n, read: true } : n
                      )
                      setNotifications(updatedNotifications)
                      // Aquí podrías agregar lógica para navegar a la publicación relacionada
                    }}
                  >
                    {notification.read ? "Ver detalles" : "Marcar como leída"}
                  </Button>
                </div>
              ))
            ) : (
              <p>No tienes notificaciones nuevas.</p>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}